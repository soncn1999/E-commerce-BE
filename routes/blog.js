const router = require('express').Router();
const ctrls = require('../controllers/blog');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');
const uploadCloud = require('../config/cloudinary.config');

router.post('/create-new-blog', [verifyAccessToken, isAdmin], ctrls.createNewBlog);
router.put('/update-blog/:bid', [verifyAccessToken, isAdmin], ctrls.updateBlog);
router.get('/get-list-blog', ctrls.getListBlog);
router.get('/get-blog/:bid', [verifyAccessToken], ctrls.getBlog);
router.put('/like-blog/:bid', [verifyAccessToken], ctrls.likeBlog);
router.put('/dis-like-blog/:bid', [verifyAccessToken], ctrls.disLikeBlog);
router.delete('/delete-blog/:bid', [verifyAccessToken, isAdmin], ctrls.deleteBlog);
router.put('/upload-image-blog/:bid', [verifyAccessToken, isAdmin], uploadCloud.single('image'), ctrls.uploadImagesBlog)

module.exports = router;