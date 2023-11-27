const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt');
const jwt = require('jsonwebtoken');
const sendMail = require('../ultils/sendMail');
var CryptoJS = require("crypto");
const { response } = require('express');

// Authentication
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname } = req.body;
    if (!email || !password || !firstname || !lastname) {
        return res.status(200).json({
            success: false,
            message: 'Missing input requirement',
            data: {}
        });
    }
    const user = await User.findOne({ email });
    if (user) {
        throw new Error('User is existing');
    } else {
        const newUser = await User.create(req.body);
        // When user acount created, we need to distribute access tokens to the new user

        const response = await User.findOne({ email });

        console.log('check user register >>> ', response);
        if (response) {
            const { password, role, refreshToken, ...userData } = response.toObject();
            const accessToken = generateAccessToken(response._id, role);
            const distributeRefreshToken = generateRefreshToken(response._id);
            await User.findByIdAndUpdate(response._id, { refreshToken: distributeRefreshToken }, { new: true });
            res.cookie('refreshToken', distributeRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                success: newUser ? true : false,
                message: newUser ? 'OK, create user account and token' : 'Create new user failed',
                data: userData,
                accessToken: accessToken,
            });
        } else {
            return res.status(200).json({
                success: newUser ? true : false,
                errCode: newUser ? 0 : 1,
                message: newUser ? 'Token has not created yet, Please Login!!!' : 'Create new user failed',
                data: {
                    email: req.body.email,
                    lastname: req.body.lastname,
                    firstname: req.body.firstname
                }
            });
        }
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(200).json({
            success: false,
            message: 'Missing input requirement',
            data: {}
        });
    }
    const response = await User.findOne({ email, isBlocked: false });

    if (response && await response.isCorrectPassword(password)) {
        const { password, role, refreshToken, ...userData } = response.toObject();
        const accessToken = generateAccessToken(response._id, role);

        const distributeRefreshToken = generateRefreshToken(response._id);
        await User.findByIdAndUpdate(response._id, { refreshToken: distributeRefreshToken }, { new: true });
        res.cookie('refreshToken', distributeRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({
            success: response ? true : false,
            errCode: response ? 0 : 1,
            message: response ? 'OK' : 'Login failed',
            data: response,
            accessToken: accessToken,
        });
    } else {
        throw new Error('OOps, You can not access acount, contact Admin to solve it!');
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    if (!_id) {
        return res.status(200).json({
            success: false,
            message: 'Missing input requirement',
            data: {}
        });
    }
    // Customize query result with limit field from table
    const excludedFields = '-slug -description -sold -rating -totalRatings -createdAt -updatedAt';

    const user = await User.findById(_id).populate('cart.product', excludedFields).select('-refreshToken -password');

    return res.status(200).json({
        success: user ? true : false,
        data: user ? user : 'User not found'
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) {
        throw new Error('No refresh token in cookie!');
    }
    const verifyRefreshToken = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
    const response = await User.findOne({ id: verifyRefreshToken._id }, { refreshToken: cookie.refreshToken });
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh Token Invalid!'
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    console.log('cookie >>> ', cookie);
    if (!cookie || !cookie.refreshToken) {
        throw new Error('No refresh token in cookies');
    }
    let response = await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    });
    return res.status(200).json({
        success: response ? true : false,
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new Error('Please enter an email!!!');
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error('User not found!!!');
    }
    const resetToken = user.createPasswordChangedToken();
    console.log('Create passwordResetToken >>> ' + resetToken);
    await user.save();
    //show view re-type password. User must type a new password before send it to the server
    let html = `<b>Click <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Here</a> to change your password</b>`;
    const data = {
        email,
        html
    }

    const mailResult = await sendMail(data);

    return res.status(200).json({
        success: true,
        mailResult
    })
});
//post + put => databody
//get  + delete => query 

const verifyResetToken = asyncHandler(async (req, res) => {
    const { password, token } = req.body;
    console.log('password >>> ' + password + ' token >>> ' + token);
    if (password || token) {
        const passwordResetToken = CryptoJS.createHash('sha256').update(token).digest('hex');
        //Query user who has passwordResetToken (hash token send by email) equal with passwordResetToken which was hashed and saved to DB before,
        //and check passwordExpires (timestamp) must be greater than current time which was sent from client to server ($gt: greate than operator)
        const user = await User.findOne({ passwordResetToken: passwordResetToken, passwordExpires: { $gt: Date.now() } });

        if (!user) {
            throw new Error('Invalid reset token!');
        }
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordChangedAt = Date.now();
        user.passwordResetExpires = undefined;
        await user.save();
        return res.status(200).json({
            success: user ? true : false,
            message: user ? 'Update password successful' : 'Update password failed',
        });
    } else {
        throw new Error('Error! Check your input!!!');
    }
});
// CRUD User
const getAllUsers = asyncHandler(async (req, res) => {
    const response = await User.find();
    const usersCopy = [...response];

    let listUsers = usersCopy.map((user) => {
        let { password, refreshToken, ...userItem } = user.toObject();
        return userItem;
    });

    return res.status(200).json({
        success: response ? true : false,
        data: listUsers,
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query;
    console.log('id delete >>> ' + _id);
    if (!_id) {
        throw new Error('Can not find user with id: ' + _id + ' check id again!');
    }
    const response = await User.findByIdAndDelete(_id);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? `User ${_id} deleted successfully!` : 'Delete failed, try again'
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    if (!id || Object.keys(req.body).length === 0) {
        throw new Error('Missing user id or user data update, try again!');
    }
    const response = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password -role');
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : `Update failed, try again!`
    });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (Object.keys(req.body).length === 0) {
        throw new Error('Missing user id or data update, try again!');
    }

    const response = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');

    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Update failed, try again!'
    });
});

const updateUserAddress = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { address } = req.body;
    if (!address) throw new Error('Missing Input Address Parameter!');
    const response = await User.findByIdAndUpdate(id, { $push: { address: address } }, { new: true }).select('-password -role -refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        updateUser: response ? response : 'Something went wrong!'
    })
});

const updateUserCartAdd = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { pid, quantity, color } = req.body;

    if (!pid || !quantity || !color) throw new Error('Invalid Input Parameter');

    const response = await User.findByIdAndUpdate(id, { $push: { cart: { product: pid, quantity, color } } }, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        userCart: response ? response : 'Something went wrong!'
    })
});

const updateUserCartEdit = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, product, quantity, color } = req.body;

    if (!_id || !quantity || !color) throw new Error('Invalid Input Parameter');

    const user = await User.findById(id).select('cart');

    const alreadyProduct = user?.cart?.find((item) => {
        return item._id.toString() == _id
    });

    if (alreadyProduct) {
        let newCart = [...user.cart];
        let cartIndex = 0;
        let cartFinding = newCart.map((item, index) => {
            if (item._id.toString() == _id) {
                cartIndex = index;
                return;
            }
        });

        if (!product) {
            req.body.product = newCart[cartIndex].product;
        }

        newCart.splice(cartIndex, 1, req.body);
        let response = await User.findByIdAndUpdate(id, { cart: newCart }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            message: response ? response : 'Something went wrong! Can not update cart!'
        })
    } else {
        return res.status(200).json({
            success: false,
            message: 'Can not find this order product!',
        });
    }
});

const updateUserCartRemove = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { cart_id } = req.body;

    if (!cart_id || !id) throw new Error('Invalid Input Parameter');
    const user = await User.findById(id).select('cart');

    const alreadyProduct = user?.cart?.find(item => item._id.toString() == cart_id);

    if (alreadyProduct) {
        let newCart = [...user.cart];
        let cartIndex = 0;
        let cartFinding = newCart.map((item, index) => {
            if (item._id.toString() == cart_id) {
                cartIndex = index;
                return;
            }
        });
        newCart.splice(cartIndex, 1);
        let response = await User.findByIdAndUpdate(id, { cart: newCart }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            message: response ? response : 'Something went wrong! Can not update cart!'
        })
    } else {
        return res.status(200).json({
            success: false,
            message: 'Can not find this order product!',
        });
    }
});

const handleBlockUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    if (uid) {
        let response = await User.findByIdAndUpdate(uid, { isBlocked: true }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            message: response ? response : 'Something went wrong! Can not block this user!'
        })
    } else {
        return res.status(200).json({
            success: false,
            message: 'Can not find this user!',
        });
    }
});

const handleRemoveBlockUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    if (uid) {
        let response = await User.findByIdAndUpdate(uid, { isBlocked: false }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            message: response ? response : 'Something went wrong! Can not block this user!'
        })
    } else {
        return res.status(200).json({
            success: false,
            message: 'Can not find this user!',
        });
    }
});

const handleGetListBlock = asyncHandler(async (req, res) => {
    let response = await User.find({ isBlocked: true });
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Something went wrong! Can not get list block user!'
    })
});

const updateCartProductReset = asyncHandler(async (req, res) => {
    const { id } = req.user;
    let response = await User.findByIdAndUpdate(id, { cart: [] }, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Something went wrong! Can not reset cart!'
    })
});


module.exports = {
    registerUser, login, getCurrentUser, refreshAccessToken,
    logout, forgotPassword, verifyResetToken, getAllUsers,
    deleteUser, updateUser, updateUserByAdmin, updateUserAddress,
    updateUserCartAdd, updateUserCartRemove, updateUserCartEdit,
    handleBlockUser, handleRemoveBlockUser, handleGetListBlock, updateCartProductReset
}