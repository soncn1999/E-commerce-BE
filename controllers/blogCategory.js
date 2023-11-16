const BlogCategory = require('../models/blogCategory');
const asyncHandle = require('express-async-handler');

const createCategory = asyncHandle(async (req, res) => {
    const { parentCategory, title } = req.body;
    if (parentCategory) {
        const response = await BlogCategory.create({
            title: title,
            isChild: true,
        });
        if (response) {
            const parent = await BlogCategory.findById(parentCategory);
            if (parent) {
                let listChildren = [...parent.childCategory];
                listChildren.push(response._id);
                const responseParent = await BlogCategory.findByIdAndUpdate(parentCategory, { childCategory: listChildren }, { new: true });

                return res.status(200).json({
                    success: responseParent ? true : false,
                    message: responseParent ? 'Create Category and Add Category Child' : 'Can not Create Category child',
                    createdCategory: responseParent ? responseParent : 'Can not create children!'
                });
            } else {
                return res.status(200).json({
                    success: response ? true : false,
                    createdCategory: response ? response : 'Can not create new blog category!'
                });
            }
        }
    } else {
        const response = await BlogCategory.create({
            title: title,
        });
        return res.status(200).json({
            success: response ? true : false,
            createdCategory: response ? response : 'Can not create new blog category!'
        });
    }
});

const getListCategory = asyncHandle(async (req, res) => {
    const response = await BlogCategory.find().select('title _id').populate('childCategory');
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