const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/scrap', checkUser, require('./contentScrapGET'));
router.post('/', checkUser, require('./contentPOST'));
router.get('/', checkUser, require('./contentListGET'));
router.get('/search', checkUser, require('./contentSearchGET'));
router.get('/recent', checkUser, require('./contentRecentListGET'));
router.get('/unseen', checkUser, require('./contentUnseenListGET'));
router.delete('/:contentId', checkUser, require('./contentDELETE'));
router.patch('/category', checkUser, require('./contentCategoryPATCH'));
router.patch('/title/:contentId', checkUser, require('./contentRenamePATCH'));
router.patch('/check', checkUser, require('./contentCheckPATCH'));

module.exports = router;