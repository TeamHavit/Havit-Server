const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/scrap', checkUser, require('./scrap'));
module.exports = router;