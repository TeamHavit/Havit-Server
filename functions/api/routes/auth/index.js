const express = require('express');
const router = express.Router();

router.post('/kakao', require('./kakaoPOST'));
router.post('/reissue', require('./reissueTokenPOST'));

module.exports = router;