const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    sold: {
        type: Number,
        default: 0,
    },
    image: {
        type: Array,
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    color: {
        type: String,
        enum: ['Black', 'Grown', 'White', 'Red', 'Green']
    },
    rating: [
        {
            star: { type: Number },
            postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
            comment: { type: String }
        }
    ],
    totalRatings: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);