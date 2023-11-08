const router = require('express').Router();
const ctrls = require('../controllers/coupon');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

router.post('/create-coupon', [verifyAccessToken, isAdmin], ctrls.createCoupon);
router.get('/get-coupon', ctrls.getCoupon);
router.put('/update-coupon/:cpid', [verifyAccessToken, isAdmin], ctrls.updateCoupon);
router.delete('/delete-coupon/:cpid', [verifyAccessToken, isAdmin], ctrls.deleteCoupon);

module.exports = router;