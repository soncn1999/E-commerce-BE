const Coupon = require('../models/coupon');
const asyncHandle = require('express-async-handler');

const createCoupon = asyncHandle(async (req, res) => {
    const { name, discount, expiry } = req.body;
    if (!name || !discount || !expiry) throw new Error('Missing Input Parameter');
    const response = await Coupon.create({
        ...req.body,
        expiry: Date.now() + (+ expiry) * 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
        success: response ? true : false,
        createdCoupon: response ? response : 'Can not create new Coupon!'
    });
});

const getCoupon = asyncHandle(async (req, res) => {
    const response = await Coupon.find().select('-createdAt -updatedAt');
    return res.status(200).json({
        success: response ? true : false,
        getCoupon: response ? response : 'Can not get Coupon!'
    });
});

const updateCoupon = asyncHandle(async (req, res) => {
    const { cpid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error('Missing Input Parameters');
    if (req.body.expiry) req.body.expiry = Date.now() + (+ req.body.expiry) * 24 * 60 * 60 * 1000;
    const response = await Coupon.findByIdAndUpdate(cpid, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        updatedCoupon: response ? response : 'Can not Update Coupon!'
    });
});

const deleteCoupon = asyncHandle(async (req, res) => {
    const { cpid } = req.params;
    const response = await Coupon.findByIdAndDelete(cpid);
    return res.status(200).json({
        success: response ? true : false,
        deletedCoupon: response ? response : 'Can not Delete Coupon!'
    });
});

module.exports = {
    createCoupon, getCoupon, updateCoupon, deleteCoupon
}