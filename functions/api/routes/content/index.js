const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/', checkUser, require('./contentPOST'));
router.get('/', checkUser, require('./contentListGET'));
router.get('/search', checkUser, require('./contentSearchGET'));
router.get('/recent', checkUser, require('./contentRecentListGET'));
router.get('/unseen', checkUser, require('./contentUnseenListGET'));
router.get('/notification', checkUser, require('./contentNotificationGET'));
router.get('/category/:contentId', checkUser, require('./contentCategroyGET'));
router.delete('/:contentId', checkUser, require('./contentDELETE'));
router.patch('/category', checkUser, require('./contentCategoryPATCH'));
router.patch('/title/:contentId', checkUser, require('./contentRenamePATCH'));
router.patch('/check', checkUser, require('./contentCheckPATCH'));
router.patch('/notification/:contentId', checkUser, require('./contentNotificationPATCH'));

module.exports = router;