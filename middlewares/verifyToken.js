const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

//Bearer token
//headers: { authorization: 'Bearer jwt_token'}

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        //Separate string to 2 part: Bearer + AccessToken
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                console.log('Verify token err >>> ', err);
                return res.status(401).json({
                    success: false,
                    errCode: 401,
                    message: 'Invalid Access Token'
                })
            }
            console.log('Decode Current User Info: ', decode);
            req.user = decode;
            next();
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Require Authentication'
        });
    }
});

const isAdmin = asyncHandler((req, res, next) => {
    let { role } = req.user;

    if (role.toLowerCase() == 'user') {
        return res.status(401).json({
            success: false,
            message: 'You have to be an administrator!'
        });
    }
    next();
})

module.exports = {
    verifyAccessToken, isAdmin
}