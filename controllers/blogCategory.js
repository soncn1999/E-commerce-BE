const BlogCategory = require('../models/blogCategory');
const asyncHandle = require('express-async-handler');

const createCategory = asyncHandle(async (req, res) => {
    const response = await BlogCategory.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        createdCategory: response ? response : 'Can not create new blog category!'
    });
});

const getListCategory = asyncHandle(async (req, res) => {
    const response = await BlogCategory.find().select('title _id');
    return res.status(200).json({
        success: response ? true : false,
        blogCategories: response ? response : 'Can not get list Blog Category!'
    });
});

const updateCategory = asyncHandle(async (req, res) => {
    const { bcid } = req.params;
    const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        updatedCategory: response ? response : 'Can not update category!'
    })
});

const deleteCategory = asyncHandle(async (req, res) => {
    const { bcid } = req.params;
    const response = await BlogCategory.findByIdAndDelete(bcid);
    return res.status(200).json({
        success: response ? true : false,
        deletedCategory: response ? response : 'Can not delete category!'
    })
});

module.exports = {
    createCategory, getListCategory, updateCategory, deleteCategory
}