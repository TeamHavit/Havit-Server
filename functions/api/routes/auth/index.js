const express = require('express');
const router = express.Router();

router.post('/kakao', require('./kakaoPOST'));

module.exports = router;