const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/signin', require('./signinPOST'));
router.post('/signup', require('./signupPOST'));
router.post('/token', require('./reissueTokenPOST'));
router.delete('/user', checkUser, require('./userDELETE'));

module.exports = router;