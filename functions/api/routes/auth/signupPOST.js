const util = require("../../../lib/util");
const statusCode = require("../../../constants/statusCode");
const responseMessage = require("../../../constants/responseMessage");
const kakao = require("../../../lib/kakaoAuth");
const db = require("../../../db/db");
const { userDB } = require("../../../db");
const functions = require("firebase-functions");
const slackAPI = require("../../../middlewares/slackAPI");
const jwtHandlers = require("../../../lib/jwtHandlers");
const { createPushServerUser } = require("../../../lib/pushServerHandlers");
const { getAppleRefreshToken } = require("../../../lib/appleAuth");

/**
 *  @route POST /auth/signup
 *  @desc 신규 유저 회원가입
 *  @access Public
 */

module.exports = async (req, res) => {
  const { fcmToken, kakaoAccessToken, firebaseUID, appleCode, nickname, email, age, gender, isOption } = req.body;

  const badRequestMessage = '[ERROR] POST /auth/signup - Bad Request';

  if (!fcmToken || (!firebaseUID && !kakaoAccessToken)) {
    // fcmToken이 없거나 firebaseUID와 kakaoAccessToken이 모두 없을 때 : 에러
    slackAPI.sendMessageToSlack(badRequestMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  };

  if (firebaseUID && kakaoAccessToken) {
    // firebaseUID와 kakaoAccessToken이 모두 있을 때 : 에러
    slackAPI.sendMessageToSlack(badRequestMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  };

  if (firebaseUID && !appleCode) {
    // firebaseUID 는 있으나 appleCode 가 없을 때 : 에러
    slackAPI.sendMessageToSlack(badRequestMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const mongoId = await createPushServerUser(fcmToken);

    if (!firebaseUID) {
      // firebaseUID가 없을 때 : 카카오 소셜 로그인
      const firebaseUserData = await kakao.createFirebaseToken(kakaoAccessToken);
      const { firebaseAuthToken, firebaseUserId } = firebaseUserData;
      const refreshToken = jwtHandlers.signRefresh();
      const kakaoUser = await userDB.addUser(client, firebaseUserId, nickname, email, age, gender, isOption, mongoId, refreshToken);
      const accessToken = jwtHandlers.sign({ id: kakaoUser.id, idFirebase: kakaoUser.idFirebase });
      return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.SIGNUP_SUCCESS, { firebaseAuthToken, accessToken, refreshToken, nickname }));
    } 
    else {
      // kakaoAccessToken이 없을 때 (!kakaoAccessToken) : 애플 소셜 로그인
       const refreshToken = jwtHandlers.signRefresh();
      const appleUser = await userDB.addUser(client, firebaseUID, nickname, email, age, gender, isOption, mongoId, refreshToken);
      const accessToken = jwtHandlers.sign({ id: appleUser.id, idFirebase: appleUser.idFirebase });
      const firebaseAuthToken = "";

      // apple refresh token 발급
      const appleRefreshToken = await getAppleRefreshToken(appleCode);
      await userDB.updateAppleRefreshToken(client, appleUser.id, appleRefreshToken);

      return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.SIGNUP_SUCCESS, { firebaseAuthToken, accessToken, refreshToken, nickname }));
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
