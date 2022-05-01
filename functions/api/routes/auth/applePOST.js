const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const kakao = require('../../../lib/kakaoAuth');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const jwtHandlers = require('../../../lib/jwtHandlers');
const ogs = require('open-graph-scraper');

/**
 *  @route POST /auth/apple
 *  @desc 애플 소셜 로그인
 *  @access Private
 */

module.exports = async (req, res) => {

  const { idFirebase, nickname, email, birthYear, gender } = req.body;
  
  if (!idFirebase || !nickname || !email || !birthYear || gender) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  let client;
  
  try {
    client = await db.connect(req);

    const user = await userDB.getUserByFirebaseId(client, idFirebase); // 기존 / 신규 유저 여부 판별
    let newUser;
    if (!user) {
    // 신규 유저인 경우 (최초 로그인) - DB에 새로운 유저 생성
    newUser = await userDB.addUser(client, idFirebase, nickname, email);
    }
    else {
    // 기존 유저인 경우 (토큰 만료로 인한 재 로그인) - DB 정보 업데이트
    newUser = await userDB.updateUserByLogin(client, idFirebase, nickname, email);
    }

    const accessToken = jwtHandlers.sign({ id: newUser.id, idFirebase: newUser.idFirebase });
    const refreshToken = jwtHandlers.signRefresh();
    
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.APPLE_LOGIN_SUCCESS), { accessToken, refreshToken });
    
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