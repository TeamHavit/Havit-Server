const express = require('express');
const router = express.Router();

router.post('/kakao', require('./kakao'));

module.exports = router;