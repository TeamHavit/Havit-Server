const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/', checkUser, require('./categoryPOST'));
router.get('/', checkUser, require('./categoryGET'));
router.get('/name', checkUser, require('./categoryNameGET'));
router.get('/:categoryId', checkUser, require('./categoryContentGET'));
router.patch('/order', checkUser, require('./categoryOrderPATCH'));
router.patch('/:categoryId', checkUser, require('./categoryPATCH'));
router.delete('/:categoryId', checkUser, require('./categoryDELETE'));

module.exports = router;