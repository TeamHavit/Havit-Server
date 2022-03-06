const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const kakao = require('../../../lib/kakaoAuth');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const jwtHandlers = require('../../../lib/jwtHandlers');

/**
 *  @route POST /auth/kakao
 *  @desc 카카오 소셜 로그인
 *  @access Private
 */

module.exports = async (req, res) => {
    const kakaoAccessToken = req.body.token; // 클라이언트에게 전달받은 Kakao Access Token

    if (!kakaoAccessToken) {
      // Kakao Access Token이 없는 경우
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_EMPTY));
    }

    const firebaseUserData = await kakao.createFirebaseToken(kakaoAccessToken);
    const { firebaseAuthToken, firebaseUserId, nickname, email } = firebaseUserData;

    let client;
  
    try {
      client = await db.connect(req);
  
      const user = await userDB.getUserByFirebaseId(client, firebaseUserId); // 기존 / 신규 유저 여부 판별
      let newUser;
      if (!user) {
        // 신규 유저인 경우 (최초 로그인) - DB에 새로운 유저 생성
        newUser = await userDB.addUser(client, firebaseUserId, nickname, email);
      }
      else {
        // 기존 유저인 경우 (토큰 만료로 인한 재 로그인) - DB 정보 업데이트
        newUser = await userDB.updateUserByLogin(client, firebaseUserId, nickname, email);
      }

      const accessToken = jwtHandlers.sign({ id: newUser.id, idFirebase: newUser.idFirebase }); // 유저 정보를 담은 accessToken 발급
      
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.KAKAO_LOGIN_SUCCESS, { firebaseAuthToken, accessToken, nickname }));
      
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
