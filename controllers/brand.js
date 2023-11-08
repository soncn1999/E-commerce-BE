const Brand = require('../models/brand');
const asyncHandle = require('express-async-handler');

const createBrand = asyncHandle(async (req, res) => {
    const response = await Brand.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        createdBrand: response ? response : 'Can not create new Brand!'
    });
});

const getListBrand = asyncHandle(async (req, res) => {
    const response = await Brand.find().select('title _id');
    return res.status(200).json({
        success: response ? true : false,
        Categories: response ? response : 'Can not get list Brand!'
    });
});

const updateBrand = asyncHandle(async (req, res) => {
    const { brid } = req.params;
    const response = await Brand.findByIdAndUpdate(brid, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        updatedBrand: response ? response : 'Can not update Brand!'
    })
});

const deleteBrand = asyncHandle(async (req, res) => {
    const { brid } = req.params;
    const response = await Brand.findByIdAndDelete(brid);
    return res.status(200).json({
        success: response ? true : false,
        deletedBrand: response ? response : 'Can not delete Brand!'
    })
});

module.exports = {
    createBrand, getListBrand, updateBrand, deleteBrand
}