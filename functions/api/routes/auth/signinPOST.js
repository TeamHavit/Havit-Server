const util = require("../../../lib/util");
const statusCode = require("../../../constants/statusCode");
const responseMessage = require("../../../constants/responseMessage");
const kakao = require("../../../lib/kakaoAuth");
const db = require("../../../db/db");
const { userDB } = require("../../../db");
const functions = require("firebase-functions");
const slackAPI = require("../../../middlewares/slackAPI");
const jwtHandlers = require("../../../lib/jwtHandlers");
const { modifyFcmToken } = require('../../../lib/pushServerHandlers');
const { getAppleRefreshToken } = require("../../../lib/appleAuth");

/**
 *  @route POST /auth/signin
 *  @desc 기존 유저 로그인
 *  @access Public
 */

module.exports = async (req, res) => {
  const { fcmToken, kakaoAccessToken, firebaseUID, appleCode } = req.body;
  
  const badRequestMessage = '[ERROR] POST /auth/signin - Bad Request';

  if (!fcmToken || (!firebaseUID && !kakaoAccessToken)) {
    // fcmToken이 없거나 firebaseUID와 kakaoAccessToken이 모두 없을 때 : 에러
    slackAPI.sendMessageToSlack(badRequestMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (firebaseUID && kakaoAccessToken) {
    // firebaseUID와 kakaoAccessToken이 모두 있을 때 : 에러
    slackAPI.sendMessageToSlack(badRequestMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  if (firebaseUID && !appleCode) {
    // firebaseUID 는 있으나 appleCode 가 없을 때 : 에러
    slackAPI.sendMessageToSlack(badRequestMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    let isAlreadyUser;

    if (!firebaseUID) {
      // firebaseUID가 없을 때 : 카카오 소셜 로그인
      const firebaseUserData = await kakao.createFirebaseToken(kakaoAccessToken);
      const { firebaseAuthToken, firebaseUserId } = firebaseUserData;
      const kakaoUser = await userDB.getUserByFirebaseId(client, firebaseUserId);

      if (!kakaoUser) {
        // 신규 사용자
        isAlreadyUser = false;
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NO_USER, { isAlreadyUser }));
      }
      else {
        // 기존 사용자
        isAlreadyUser = true;
        const accessToken = jwtHandlers.sign({ id: kakaoUser.id, idFirebase: kakaoUser.idFirebase });
        const refreshToken = jwtHandlers.signRefresh();
        const nickname = kakaoUser.nickname;

        const response = await modifyFcmToken(kakaoUser.mongoUserId, fcmToken);

        if (response.status != 204) {
          return res.status(response.statusCode).send(util.fail(response.statusCode, responseMessage.PUSH_SERVER_ERROR));
        }

        await userDB.updateRefreshToken(client, kakaoUser.id, refreshToken);

        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGNIN_SUCCESS, 
          { firebaseAuthToken, accessToken, refreshToken, nickname }));
      };
    } 
    else {
      // kakaoAccessToken이 없을 때 (!kakaoAccessToken) : 애플 소셜 로그인
      const appleUser = await userDB.getUserByFirebaseId(client, firebaseUID);

      if (!appleUser) {
        // 신규 사용자
        isAlreadyUser = false;
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NO_USER, { isAlreadyUser }));
      }
      else {
        // 기존 사용자
        const accessToken = jwtHandlers.sign({ id: appleUser.id, idFirebase: appleUser.idFirebase });
        const refreshToken = jwtHandlers.signRefresh();
        const nickname = appleUser.nickname;
        const firebaseAuthToken = "";

        // apple refresh token 발급
        const appleRefreshToken = await getAppleRefreshToken(appleCode);
        await userDB.updateAppleRefreshToken(client, appleUser.id, appleRefreshToken);

        const response = await modifyFcmToken(appleUser.mongoUserId, fcmToken);

        if (response.status != 204) {
          return res.status(response.statusCode).send(util.fail(response.statusCode, responseMessage.PUSH_SERVER_ERROR));
        }

        await userDB.updateRefreshToken(client, appleUser.id, refreshToken);
        
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGNIN_SUCCESS, 
          { firebaseAuthToken, accessToken, refreshToken, nickname }));
      };
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : "req.user 없음"} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
