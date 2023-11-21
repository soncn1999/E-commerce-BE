const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    product: [
        {
            product: { type: mongoose.Types.ObjectId, ref: 'Product' },
            count: Number,
            color: String
        }
    ],
    status: {
        type: String,
        default: 'Processing',
        enum: ['Cancelled', 'Processing', 'Successed']
    },
    total: {
        type: Number,
        default: 0
    },
    totalItem: {
        type: Number,
        default: 0
    },
    coupon: {
        type: mongoose.Types.ObjectId,
        ref: 'Coupon'
    },
    orderBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    isCheckOut: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);