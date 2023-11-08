const Blog = require('../models/blog');
const asyncHandler = require('express-async-handler');

const createNewBlog = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;
    if (!title || !description || !category) throw new Error("Missing Input Parameters!");
    const response = await Blog.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        createdBlog: response ? response : 'Cannot create new blog',
    });
});

const updateBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error("Missing Input Parameters!");
    const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        blogUpdated: response ? response : 'Cannot update this blog',
    });
});

const getListBlog = asyncHandler(async (req, res) => {
    const response = await Blog.find();
    return res.status(200).json({
        success: response ? true : false,
        listBlog: response ? response : 'Cannot get list this blog',
    });
});

const getBlog = asyncHandler(async (req, res) => {
    const excludedFields = '-refreshToken -password -role -createdAt -updateAt -passwordExpires -passwordChangedAt';
    const { id } = req.user;
    const { bid } = req.params;
    if (!bid) throw new Error('Invalid Input Parameter!');
    const response = await Blog.findById(bid).populate('likes', excludedFields).populate('dislikes', excludedFields);

    const numberViews = response?.numberViews + +1;

    await Blog.findByIdAndUpdate(bid, { numberViews: numberViews }, { new: true });

    const checkEmotionLike = response.likes.find(user => user.toString() == id);
    const checkEmotionDisLike = response.dislikes.find(user => user.toString() == id);

    if (!checkEmotionLike && !checkEmotionDisLike) {
        response.emotionStatus = 0;
        return res.status(200).json({
            success: response ? true : false,
            blogData: response ? response : 'Cannot get blog data'
        });
    } else if (checkEmotionLike) {
        response.isLiked = true;
        return res.status(200).json({
            success: response ? true : false,
            blogData: response ? response : 'Cannot get blog data'
        });
    } else {
        response.isDisliked = true;
        return res.status(200).json({
            success: response ? true : false,
            blogData: response ? response : 'Cannot get blog data'
        });
    }
});

// Like & Dislike: Check current like or dislike status when user press like button
// Status: Dislike => like
// Status # Dislike => check status is like (remove like) or undefine (add like)

const likeBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    const { id } = req.user;

    if (!bid) throw new Error("Invalid Input Parameter");
    const blog = await Blog.findById(bid);

    let alreadyLike = blog.likes.find(user => user.toString() == id);

    let newLikeArr = [...blog.likes];
    if (alreadyLike) {
        let currentLikeIndex = 0;
        let likeIndexFinding = newLikeArr.map((user, index) => {
            if (user.toString() == id) {
                currentLikeIndex = index;
                return;
            }
        });

        newLikeArr.splice(currentLikeIndex, 1);
        const response = await Blog.findByIdAndUpdate(bid, { likes: newLikeArr }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            message: response ? 'You unliked this blog' : 'Oops! Something went wrong',
        });
    } else {
        //Update Fix
        const alreadyDisLike = blog.dislikes.find((user) =>
            user.toString() == id);
        if (alreadyDisLike) {
            let newDisLikeArr = [...blog.dislikes];

            let currentDisLikeIndex = 0;
            let likeIndexFinding = newDisLikeArr.map((user, index) => {
                if (user.toString() == id) {
                    currentDisLikeIndex = index;
                    return;
                }
            });

            newDisLikeArr.splice(currentDisLikeIndex, 1);

            newLikeArr.push(id);
            const response = await Blog.findByIdAndUpdate(bid, { likes: newLikeArr, dislikes: newDisLikeArr }, { new: true });
            return res.status(200).json({
                success: response ? true : false,
                message: response ? 'You undisliked and add liked this blog' : 'Oops! Something went wrong',
            });
        } else {
            newLikeArr = [...blog.likes];
            newLikeArr.push(id);
            const response = await Blog.findByIdAndUpdate(bid, { likes: newLikeArr }, { new: true });
            return res.status(200).json({
                success: response ? true : false,
                message: response ? 'You liked this blog' : 'Oops! Something went wrong',
            });
        }
    }
});

const disLikeBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    const { id } = req.user;

    if (!bid) throw new Error("Invalid Input Parameter");
    const blog = await Blog.findById(bid);

    let alreadyDisLike = blog.dislikes.find(user => user.toString() == id);

    let newDisLikeArr = [...blog.dislikes];
    if (alreadyDisLike) {
        let currentDisLikeIndex = 0;
        let likeIndexFinding = newDisLikeArr.map((user, index) => {
            if (user.toString() == id) {
                currentDisLikeIndex = index;
                return;
            }
        });

        newDisLikeArr.splice(currentDisLikeIndex, 1);
        const response = await Blog.findByIdAndUpdate(bid, { dislikes: newDisLikeArr }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            message: response ? 'You undisliked this blog' : 'Oops! Something went wrong',
        });
    } else {
        const alreadyLike = blog.likes.find((user) =>
            user.toString() == id);
        if (alreadyLike) {
            let newLikeArr = [...blog.likes];

            let currentLikeIndex = 0;
            let likeIndexFinding = newLikeArr.map((user, index) => {
                if (user.toString() == id) {
                    currentLikeIndex = index;
                    return;
                }
            });

            newLikeArr.splice(currentLikeIndex, 1);

            newDisLikeArr.push(id);
            const response = await Blog.findByIdAndUpdate(bid, { likes: newLikeArr, dislikes: newDisLikeArr }, { new: true });
            return res.status(200).json({
                success: response ? true : false,
                message: response ? 'You unliked and add disliked this blog' : 'Oops! Something went wrong',
            });
        } else {
            newDisLikeArr = [...blog.dislikes];
            newDisLikeArr.push(id);
            const response = await Blog.findByIdAndUpdate(bid, { dislikes: newDisLikeArr }, { new: true });
            return res.status(200).json({
                success: response ? true : false,
                message: response ? 'You disliked this blog' : 'Oops! Something went wrong',
            });
        }
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    const response = await Blog.findByIdAndDelete(bid);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? response : 'Something went wrong',
    })
});

const uploadImagesBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;

    if (!bid || !req.file) throw new Error('Missing Images Upload Params!');

    const response = await Blog.findByIdAndUpdate(bid, { image: req.file.path }, { new: true });
    return res.status(200).json({
        success: response ? response : 'Saving images failed, try again!',
    });
});

module.exports = {
    createNewBlog, updateBlog, getListBlog, getBlog,
    likeBlog, disLikeBlog, deleteBlog, uploadImagesBlog
}