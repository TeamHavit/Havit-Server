const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require("../../../db");
const { getAuth } = require('firebase-admin/auth');

/**
 *  @route POST /auth/delete
 *  @desc 회원 탈퇴
 *  @access Public
 */

module.exports = async (req, res) => {

  const { userId } = req.user;
  let client;
  
  try {
    client = await db.connect(req);

    const deleteUser = await userDB.getUser(client, userId);
    await getAuth().deleteUser(deleteUser.idFirebase);
    await userDB.deleteUser(client, userId);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_USER));

  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    
  } finally {
    client.release();
  }
};