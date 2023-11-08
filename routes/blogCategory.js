const router = require('express').Router();
const ctrls = require('../controllers/blogCategory');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

router.post('/create-blog-category', [verifyAccessToken, isAdmin], ctrls.createCategory);
router.get('/get-list-blog-category', ctrls.getListCategory);
router.put('/update-blog-category/:pcid', [verifyAccessToken, isAdmin], ctrls.updateCategory);
router.delete('/delete-blog-category/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteCategory);

module.exports = router;