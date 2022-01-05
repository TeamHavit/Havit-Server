const express = require('express');
const router = express.Router();

router.use('/scrap', require('./scrap'));
module.exports = router;