const express = require('express');
const router = express.Router();

router.post('/signin', require('./signinPOST'));
router.post('/token', require('./reissueTokenPOST'));

module.exports = router;