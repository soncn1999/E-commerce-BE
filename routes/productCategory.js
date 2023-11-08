const router = require('express').Router();
const ctrls = require('../controllers/productCategory');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

router.post('/create-category', [verifyAccessToken, isAdmin], ctrls.createCategory);
router.get('/get-list-category', ctrls.getListCategory);
router.put('/update-category/:pcid', [verifyAccessToken, isAdmin], ctrls.updateCategory);
router.delete('/delete-category/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteCategory);

module.exports = router;