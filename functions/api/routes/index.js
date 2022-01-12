const express = require('express');
const router = express.Router();

router.use('/content', require('./content'));
router.use('/category', require('./category'));

module.exports = router;