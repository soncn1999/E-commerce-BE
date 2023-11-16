const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: false,
        index: true,
    },
    isChild: {
        type: Boolean,
        default: false,
    },
    childCategory: [{
        type: mongoose.Types.ObjectId, ref: 'ProductCategory'
    }],
}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('ProductCategory', productCategorySchema);