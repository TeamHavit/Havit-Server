const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/scrap', checkUser, require('./scrap'));
router.post('/', checkUser, require('./contentPOST'));
router.patch('/check', checkUser, require('./checkPATCH'));
module.exports = router;