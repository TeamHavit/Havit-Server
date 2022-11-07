const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, contentDB, categoryDB } = require('../../../db');

module.exports = async (req, res) => {

  const { userId } = req.user;

  let client;
  
  try {
    client = await db.connect(req);

    const user = await userDB.getUser(client, userId);
    const contents = await contentDB.getContentsByFilter(client, userId, 'created_at');
    const categories = await categoryDB.getAllCategories(client, userId);
    const unSeenContents = await contentDB.getUnseenContents(client, userId);
    
    const result = {
        nickname : user.nickname,
        email: user.email,
        totalContentNumber : contents.length,
        totalCategoryNumber : categories.length,
        totalSeenContentNumber : contents.length - unSeenContents.length
    };
    
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_USER_SUCCESS, result));
    
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    
  } finally {
    client.release();
  }
};