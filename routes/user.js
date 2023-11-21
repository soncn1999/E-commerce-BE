const router = require('express').Router();
const ctrls = require('../controllers/user');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

router.post('/register', ctrls.registerUser);
router.post('/login', ctrls.login);
router.get('/current/:_id', verifyAccessToken, ctrls.getCurrentUser);
router.post('/refresh-token', ctrls.refreshAccessToken);
router.get('/logout', ctrls.logout);
router.get('/forgotpassword', ctrls.forgotPassword);
router.put('/resetpassword', ctrls.verifyResetToken);
router.get('/getallusers', [verifyAccessToken, isAdmin], ctrls.getAllUsers);
router.delete('/deleteuser', [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.put('/updateuser', verifyAccessToken, ctrls.updateUser);
router.put('/updateuserbyadmin', [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);
router.put('/blockuser/:uid', [verifyAccessToken, isAdmin], ctrls.handleBlockUser);
router.put('/removeblockuser/:uid', [verifyAccessToken, isAdmin], ctrls.handleRemoveBlockUser);
router.get('/getlistblockuser', [verifyAccessToken, isAdmin], ctrls.handleGetListBlock);
router.put('/updateuseraddress', verifyAccessToken, ctrls.updateUserAddress);
router.put('/update-cart-product-add', verifyAccessToken, ctrls.updateUserCartAdd);
router.put('/update-cart-product-edit', verifyAccessToken, ctrls.updateUserCartEdit);
router.put('/update-cart-product-remove', verifyAccessToken, ctrls.updateUserCartRemove);
router.put('/update-cart-product-reset', verifyAccessToken, ctrls.updateCartProductReset);

module.exports = router;