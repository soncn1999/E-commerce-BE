const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const { removeVietnameseTones } = require('../ultils/removeRegex');
const { query, response } = require('express');

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        throw new Error('No data to create product');
    }

    if (req.body && req.body.title) {
        let slug = removeVietnameseTones(req.body.title).toLowerCase();
        req.body.slug = slugify(slug);
    }

    const newProduct = await Product.create(req.body);
    return res.status(200).json({
        success: newProduct ? true : false,
        data: newProduct ? newProduct : {}
    });
});

const getAllProduct = asyncHandler(async (req, res) => {
    const queries = { ...req.query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    //Filtering Products
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, macthedEl => `$${macthedEl}`);
    const formatedQueries = JSON.parse(queryString);

    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' };
    let queryCommand = Product.find(formatedQueries);

    //Sorting Products
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
    }

    //Fields Limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }
    //Pagination
    //Limit: Tổng số phần tử lấy về 1 lần gọi
    //Skip(Offset): Bỏ qua các phần tử ban đầu
    const page = +req.query.page || 1;
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);

    queryCommand.exec(async (err, response) => {
        if (err) throw new Error(err.message);
        const counts = await Product.find(formatedQueries).countDocuments();
        return res.status(200).json({
            success: response ? true : false,
            total: Math.ceil(counts / limit),
            page: page,
            product: response ? response : 'Can not find Product Results'
        });
    });
})

const getProduct = asyncHandler(async (req, res) => {
    let { id } = req.query;
    if (!id) {
        throw new Error('Invalid Id Product!!!');
    }
    const excludedFields = '-password -cart -wishlist -createdAt -updatedAt -refreshToken';
    let response = await Product.findOne({ _id: id }).populate('rating.postedBy', excludedFields);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? 'OK' : 'Get Product by ID failed',
        data: response
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!id) {
        throw new Error('Invalid Product ID, try again!');
    }
    let response = await Product.findByIdAndUpdate(id, { isRevoked: true }, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Failed to revoke product'
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!id || Object.keys(req.body).length === 0) {
        throw new Error('Invalid Product ID, try again!');
    }

    if (req.body && req.body.title) {
        let slug = removeVietnameseTones(req.body.title).toLowerCase();
        req.body.slug = slugify(slug);
    }

    let response = await Product.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        message: response ? `Product ${id} has been updated` : 'Update failed',
        data: response
    });
});

const ratingsByUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { star, comment, pid } = req.body;

    if (!star || !pid) throw new Error('Missing inputs!');

    // const ratingProduct = await Product.findById(pid);

    // Check people who rated this product
    // const alreadyRating = ratingProduct?.rating?.some(el => el.postedBy == id);

    // if (alreadyRating) {
    //     // Update stars and comments
    //     await Product.updateOne({
    //         rating: { $elemMatch: { alreadyRating } },
    //     }, {
    //         $set: { "rating.$.star": star, "rating.$.comment": comment }
    //     }, { new: true });
    // } else {
    //     // Add stars and comments
    //     await Product.findByIdAndUpdate(pid, {
    //         $push: { rating: { star: star, comment: comment, postedBy: id } }
    //     }, { new: true });
    // }

    const response = await Product.findByIdAndUpdate(pid, {
        $push: { rating: { star: star, comment: comment, postedBy: id } }
    }, { new: true });

    //Sum Ratings
    const updatedProduct = await Product.findById(pid);
    const ratingCount = updatedProduct.rating.length;
    const sumRatings = updatedProduct.rating.reduce((sum, el) => sum + el.star, 0);
    updatedProduct.totalRatings = Math.round(sumRatings * 10 / ratingCount) / 10;
    await updatedProduct.save();
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : 'Comment was not sended!',
    });
});

const uploadImagesProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;

    if (!pid || !req.files) throw new Error('Missing Images Upload Params!');

    let imagePaths = [];
    req.files.map(file => imagePaths.push(file.path));

    const response = await Product.findByIdAndUpdate(pid, { image: imagePaths }, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : 'Saving images failed, try again!',
    });
});

module.exports = {
    createProduct, getProduct, getAllProduct,
    deleteProduct, updateProduct, ratingsByUser, uploadImagesProduct
}