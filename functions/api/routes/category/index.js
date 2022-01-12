const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/', checkUser, require('./categoryPOST'));
module.exports = router;