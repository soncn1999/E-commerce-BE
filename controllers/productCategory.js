const ProductCategory = require('../models/productCategory');
const asyncHandle = require('express-async-handler');

const createCategory = asyncHandle(async (req, res) => {
    const response = await ProductCategory.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        createdCategory: response ? response : 'Can not create new category!'
    });
});

const getListCategory = asyncHandle(async (req, res) => {
    const response = await ProductCategory.find().select('title _id');
    return res.status(200).json({
        success: response ? true : false,
        productCategories: response ? response : 'Can not get list category!'
    });
});

const updateCategory = asyncHandle(async (req, res) => {
    const { pcid } = req.params;

    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        updatedCategory: response ? response : 'Can not update category!'
    })
});

const deleteCategory = asyncHandle(async (req, res) => {
    const { pcid } = req.params;
    const response = await ProductCategory.findByIdAndDelete(pcid);
    return res.status(200).json({
        success: response ? true : false,
        deletedCategory: response ? response : 'Can not delete category!'
    })
});

module.exports = {
    createCategory, getListCategory, updateCategory, deleteCategory
}