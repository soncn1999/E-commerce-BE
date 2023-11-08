const Order = require('../models/order');
const User = require('../models/user');
const Coupon = require('../models/coupon');
const asyncHandler = require('express-async-handler');

const createOrder = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { coupon_id } = req.body;
    const userCart = await User.findById(id).select('cart').populate('cart.product', 'title price');

    const products = userCart?.cart.map((item) => {
        return {
            product: item.product._id,
            count: item.quantity,
            color: item.color
        }
    });

    let totalPayment = userCart?.cart.reduce((sum, item) => {
        return item.product.price * item.quantity + sum;
    }, 0);

    if (coupon_id) {
        try {
            let coupon = await Coupon.findById(coupon_id);
            if (coupon) {
                totalPayment = Math.round(totalPayment * (1 - coupon?.discount / 100) / 1000) * 1000;
                const response = await Order.create({ product: products, total: totalPayment, orderBy: id });
                return res.status(200).json({
                    success: response ? true : false,
                    coupon: coupon ? coupon : 'Something went wrong',
                    message: response ? response : 'Something went wrong'
                });
            } else {
                return res.status(200).json({
                    success: false,
                    message: 'Coupon is out of date or missing input information!',
                });
            }
        } catch (error) {
            return res.status(200).json({
                success: false,
                message: 'Missing input information!',
            });
        }
    } else {
        const response = await Order.create({ product: products, total: totalPayment, orderBy: id });
        return res.status(200).json({
            success: response ? true : false,
            totalPayment: totalPayment,
            order: response
        });
    }
});

const updateStatusOrder = asyncHandler(async (req, res) => {
    const { oid } = req.params;
    const { status } = req.body;
    if (!status) throw new Error('Invalid status!');
    const response = await Order.findByIdAndUpdate(oid, { status }, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Something went wrong! Try again later'
    });
});

const getUserOrder = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const response = await Order.find({ orderBy: id });
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Something went wrong! Try again later'
    });
});

const getListOrder = asyncHandler(async (req, res) => {
    const response = await Order.find();
    return res.status(200).json({
        success: response ? true : false,
        listOrder: response ? response : 'Something went wrong! Try again later'
    })
});

const removeOrder = asyncHandler(async (req, res) => {
    const { oid } = req.params;
    console.log(oid);
    const response = await Order.findByIdAndDelete(oid);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Something went wrong! Try again later'
    });
});

module.exports = {
    createOrder, updateStatusOrder, getUserOrder, getListOrder, removeOrder
}