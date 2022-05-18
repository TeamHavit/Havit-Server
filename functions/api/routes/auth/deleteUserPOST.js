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
  let deleteUser;
  
  try {
    // DB 통신
    client = await db.connect(req);
    deleteUser = await userDB.getUser(client, userId); // DB에서 해당 유저 정보 받아 옴    
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)); // DB 관련 에러 : 500 INTERNAL SERVER ERROR
  } 
  
  try {
    // Firebase Auth와 통신
    // await getAuth().getUser(deleteUser.idFirebase); // delete로도 404 잡을 수 있어서 getUser 굳이 한번 더 할 필요가 없을 것 같은뎅
    await getAuth().deleteUser(deleteUser.idFirebase); // Firebase Auth에서 해당 유저 삭제
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER)); // Firebase Auth에 해당 유저 존재하지 않을 경우 : 404 NOT FOUND
  }

  try {
    await userDB.deleteUser(client, userId); // DB에서 해당 유저 삭제
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_USER));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)); // DB 관련 에러 : 500 INTERNAL SERVER ERROR 
  }

  finally {
    client.release();
  }
};