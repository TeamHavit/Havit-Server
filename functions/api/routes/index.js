const express = require('express');
const router = express.Router();

router.use('/content', require('./content'));
router.use('/category', require('./category'));
router.use('/recommendation', require('./recommendation'));
router.use('/user', require('./user'));

module.exports = router;