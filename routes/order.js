const router = require('express').Router();
const ctrls = require('../controllers/order');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');
const uploadCloud = require('../config/cloudinary.config');

router.post('/create-new-order', [verifyAccessToken, isAdmin], ctrls.createOrder);
router.put('/update-status-order/:oid', [verifyAccessToken, isAdmin], ctrls.updateStatusOrder);
router.put('/update-payment-order/:oid', [verifyAccessToken, isAdmin], ctrls.updatePaymentOrder);
router.get('/get-user-order', [verifyAccessToken, isAdmin], ctrls.getUserOrder);
router.get('/get-list-order', [verifyAccessToken, isAdmin], ctrls.getListOrder);
router.delete('/remove-order/:oid', [verifyAccessToken, isAdmin], ctrls.removeOrder);
router.get('/get-detail-order/:oid', [verifyAccessToken], ctrls.getDetailOrder);

module.exports = router;