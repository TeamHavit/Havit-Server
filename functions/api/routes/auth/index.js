const express = require('express');
const router = express.Router();

router.post('/kakao', require('./kakaoPOST'));
router.post('/reissue', require('./reissueTokenPOST'));
router.post('/apple', require('./applePOST'));

module.exports = router;