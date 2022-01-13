const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/scrap', checkUser, require('./scrap'));
router.post('/', checkUser, require('./contentPOST'));
module.exports = router;