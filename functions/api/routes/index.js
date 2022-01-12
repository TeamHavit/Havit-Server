const express = require('express');
const router = express.Router();

router.use('/scrap', require('./scrap'));
router.use('/category', require('./category'));

module.exports = router;