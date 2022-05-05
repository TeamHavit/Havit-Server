const util = require("../../../lib/util");
const statusCode = require("../../../constants/statusCode");
const responseMessage = require("../../../constants/responseMessage");
const kakao = require("../../../lib/kakaoAuth");
const db = require("../../../db/db");
const { userDB } = require("../../../db");
const functions = require("firebase-functions");
const slackAPI = require("../../../middlewares/slackAPI");
const jwtHandlers = require("../../../lib/jwtHandlers");

/**
 *  @route POST /auth/signin
 *  @desc 기존 유저 로그인
 *  @access Private
 */

module.exports = async (req, res) => {
  const { fcmToken, kakaoAccessToken, firebaseUID } = req.body;

  if (!fcmToken || (!firebaseUID && !kakaoAccessToken)) {
    // firebaseUID와 kakaoAccessToken이 모두 없을 때 : 에러
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (firebaseUID && kakaoAccessToken) {
    // firebaseUID와 kakaoAccessToken이 모두 있을 때 : 에러
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
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
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER, { isAlreadyUser }));
      }
      else {
        // 기존 사용자
        isAlreadyUser = true;
        const accessToken = jwtHandlers.sign({ id: kakaoUser.id, idFirebase: kakaoUser.idFirebase });
        const refreshToken = jwtHandlers.signRefresh();
        const nickname = kakaoUser.nickname;
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, 
          { isAlreadyUser, firebaseAuthToken, accessToken, refreshToken, nickname }));
      };
    } 
    else {
      // kakaoAccessToken이 없을 때 (!kakaoAccessToken) : 애플 소셜 로그인
      const appleUser = await userDB.getUserByFirebaseId(client, firebaseUID);

      if (!appleUser) {
        // 신규 사용자
        isAlreadyUser = false;
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER, { isAlreadyUser }));
      }
      else {
        // 기존 사용자
        const accessToken = jwtHandlers.sign({ id: appleUser.id, idFirebase: appleUser.idFirebase });
        const refreshToken = jwtHandlers.signRefresh();
        const nickname = appleUser.nickname;
        const firebaseAuthToken = "";
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_OK, 
          { isAlreadyUser, firebaseAuthToken, accessToken, refreshToken, nickname }));
      };
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : "req.user 없음"} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
