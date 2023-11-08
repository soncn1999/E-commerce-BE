const router = require('express').Router();
const ctrls = require('../controllers/product');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');
const uploadCloud = require('../config/cloudinary.config');

router.post('/createnewproduct', [verifyAccessToken, isAdmin], ctrls.createProduct);
router.get('/getproduct', ctrls.getProduct);
router.get('/getallproduct', ctrls.getAllProduct);
router.delete('/deleteproduct', [verifyAccessToken, isAdmin], ctrls.deleteProduct);
router.put('/updateproduct', [verifyAccessToken, isAdmin], ctrls.updateProduct);
router.put('/rating', verifyAccessToken, ctrls.ratingsByUser);
router.put('/upload-image-product/:pid', [verifyAccessToken, isAdmin], uploadCloud.array('images', 10), ctrls.uploadImagesProduct)

module.exports = router;