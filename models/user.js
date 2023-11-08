const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
var CryptoJS = require("crypto");
// Declare the Schema of the Mongo model

var userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    cart: [{
        product: { type: mongoose.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        color: String,
    }],
    address: {
        type: String,
    },
    wishlist: [
        { type: mongoose.Types.ObjectId, ref: 'Product' }
    ],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    passwordChangedAt: {
        type: String,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: String,
    },
    passwordExpires: {
        type: String,
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    createPasswordChangedToken: function () {
        const resetToken = CryptoJS.randomBytes(32).toString('hex');
        this.passwordResetToken = CryptoJS.createHash('sha256').update(resetToken).digest('hex');
        this.passwordExpires = Date.now() + 15 * 60 * 1000;
        console.log('passwordExpiresSaveDB: ' + this.passwordExpires);
        return resetToken;
    },
}

//Export the model
module.exports = mongoose.model('User', userSchema);