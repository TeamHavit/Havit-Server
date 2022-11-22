const express = require('express');
const router = express.Router();

router.use('/content', require('./content'));
router.use('/category', require('./category'));
router.use('/recommendation', require('./recommendation'));
router.use('/user', require('./user'));
router.use('/auth', require('./auth'));
router.use('/notice', require('./notice'));
router.use('/health', require('./health'));

module.exports = router;