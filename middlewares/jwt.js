const jwt = require('jsonwebtoken');

const generateAccessToken = (uid, role) => jwt.sign({ id: uid, role }, process.env.JWT_SECRET, {
    expiresIn: '1h'
});

const generateRefreshToken = (uid) => jwt.sign({ id: uid }, process.env.JWT_SECRET, {
    expiresIn: '2h'
});

module.exports = {
    generateAccessToken, generateRefreshToken
}