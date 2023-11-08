const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    expiry: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);