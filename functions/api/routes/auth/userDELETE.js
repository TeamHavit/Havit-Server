const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require("../../../db");
const { getAuth } = require('firebase-admin/auth');
const { nanoid } = require("nanoid");
const { deletePushUser } = require('../../../lib/pushServerHandlers');

/**
 *  @route DELETE /auth/user
 *  @desc 회원 탈퇴
 *  @access Public
 */

module.exports = async (req, res) => {

  const { userId } = req.user;
  let client;
  let deleteUser;
  
  try {
    client = await db.connect(req);

    deleteUser = await userDB.getUser(client, userId); // DB에서 해당 유저 정보 받아 옴    
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    
    client.release();
    
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)); // DB 관련 에러 : 500 INTERNAL SERVER ERROR
  } 

  try {
    await getAuth().deleteUser(deleteUser.idFirebase); // Firebase Auth에서 해당 유저 삭제
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    
    client.release();
    
    if (error.errorInfo.code === 'auth/user-not-found') {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER)); // Firebase Auth에 해당 유저 존재하지 않을 경우 : 404 NOT FOUND
    } else {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)); // 기타 Firebase Auth 에러 : 500 INTERNAL SERVER ERROR
    }
  }

  try {
    const randomString = `:${nanoid(10)}`;
    await userDB.deleteUser(client, userId, randomString); // DB에서 해당 유저 삭제

    const response = await deletePushUser(deleteUser.mongoUserId);
    if (response.status != 204) {
      return res.status(response.statusCode).send(util.fail(response.statusCode, response.statusText));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_USER));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)); // DB 관련 에러 : 500 INTERNAL SERVER ERROR 
  }
  finally {
    client.release();
  }
};