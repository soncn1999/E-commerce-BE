const router = require('express').Router();
const ctrls = require('../controllers/brand');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

router.post('/create-brand', [verifyAccessToken, isAdmin], ctrls.createBrand);
router.get('/get-list-brand', ctrls.getListBrand);
router.put('/update-brand/:brid', [verifyAccessToken, isAdmin], ctrls.updateBrand);
router.delete('/delete-brand/:brid', [verifyAccessToken, isAdmin], ctrls.deleteBrand);

module.exports = router;