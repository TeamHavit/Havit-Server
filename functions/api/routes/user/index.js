const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/', checkUser, require('./userGET'));
router.put('/fcm-token', checkUser, require('./userUpdateFcmTokenPUT'));

module.exports = router;