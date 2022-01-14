const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/scrap', checkUser, require('./scrap'));
router.post('/', checkUser, require('./contentPOST'));
router.patch('/check', checkUser, require('./checkPATCH'));
router.get('/', checkUser, require('./contentListGET'));
router.get('/search', checkUser, require('./contentSearchGET'));
module.exports = router;