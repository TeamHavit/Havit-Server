const express = require('express');
const router = express.Router();

router.use('/content', require('./content'));
router.use('/category', require('./category'));
router.use('/recommendation', require('./recommendation'));

module.exports = router;