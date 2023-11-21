const ProductCategory = require('../models/productCategory');
const asyncHandle = require('express-async-handler');

const createCategory = asyncHandle(async (req, res) => {
    const { parentCategory, title } = req.body;
    if (parentCategory) {
        const response = await ProductCategory.create({
            title: title,
            isChild: true,
        });
        if (response) {
            const parent = await ProductCategory.findById(parentCategory);
            if (parent) {
                let listChildren = [...parent.childCategory];
                listChildren.push(response._id);
                const responseParent = await ProductCategory.findByIdAndUpdate(parentCategory, { childCategory: listChildren }, { new: true });

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
        const response = await ProductCategory.create({
            title: title,
        });

        return res.status(200).json({
            success: response ? true : false,
            createdCategory: response ? response : 'Can not create new blog category!'
        });
    }
});

const getListCategory = asyncHandle(async (req, res) => {
    const response = await ProductCategory.find().populate('childCategory').select('title _id isChild');
    return res.status(200).json({
        success: response ? true : false,
        productCategories: response ? response : 'Can not get list category!'
    });
});

const getDetailCategory = asyncHandle(async (req, res) => {
    const { pcid } = req.params;
    const response = await ProductCategory.findById(pcid).populate('childCategory').select('title _id isChild');
    return res.status(200).json({
        success: response ? true : false,
        productCategories: response ? response : 'Can not get detail category!'
    });
});

const updateCategory = asyncHandle(async (req, res) => {
    const { pcid } = req.params;

    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        updatedCategory: response ? response : 'Can not update category!'
    });
});

const deleteCategory = asyncHandle(async (req, res) => {
    const { pcid } = req.params;

    const category = await ProductCategory.findById(pcid);

    if (!category.isChild && category.childCategory?.length > 0) {
        category.childCategory && category.childCategory?.length > 0 && category.childCategory.forEach(async (item) => {
            let response_relation = await ProductCategory.findByIdAndUpdate(item, { isChild: false }, { new: true });
        });

        let response = await ProductCategory.findByIdAndDelete(pcid);
        return res.status(200).json({
            success: response ? true : false,
            deletedCategory: response ? response : 'Can not delete category!'
        });
    } else {
        let response = await ProductCategory.findByIdAndDelete(pcid);
        return res.status(200).json({
            success: response ? true : false,
            deletedCategory: response ? response : 'Can not delete category!'
        });
    }


});

module.exports = {
    createCategory, getListCategory, updateCategory, deleteCategory, getDetailCategory
}