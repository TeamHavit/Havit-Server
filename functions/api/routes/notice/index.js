const express = require('express');
const router = express.Router();

router.get('/', require('./noticeGET'));

module.exports = router;