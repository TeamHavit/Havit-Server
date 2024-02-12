const util = require("../../../lib/util");
const statusCode = require("../../../constants/statusCode");
const responseMessage = require("../../../constants/responseMessage");
const kakao = require("../../../lib/kakaoAuth");
const db = require("../../../db/db");
const { userDB } = require("../../../db");
const jwtHandlers = require("../../../lib/jwtHandlers");
const { modifyFcmToken } = require('../../../lib/pushServerHandlers');
const { getAppleRefreshToken } = require("../../../lib/appleAuth");
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route POST /auth/signin
 *  @desc 기존 유저 로그인
 *  @access Public
 */

module.exports = asyncWrapper(async (req, res) => {
  const { fcmToken, kakaoAccessToken, firebaseUID, appleCode } = req.body;
  
  if ((!fcmToken || (!firebaseUID && !kakaoAccessToken)) // fcmToken이 없거나 firebaseUID와 kakaoAccessToken이 모두 없을 때
    || (firebaseUID && kakaoAccessToken) // firebaseUID와 kakaoAccessToken이 모두 있을 때
    || (firebaseUID && !appleCode)) { // firebaseUID는 있으나 appleCode 가 없을 때
      const badRequestError = new Error();
      badRequestError.statusCode = statusCode.BAD_REQUEST;
      badRequestError.responseMessage = (firebaseUID && kakaoAccessToken)? responseMessage.OUT_OF_VALUE : responseMessage.NULL_VALUE;
      throw badRequestError;
  }

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;
  let isAlreadyUser;

  if (!firebaseUID) {
    // firebaseUID가 없을 때 : 카카오 소셜 로그인
    const firebaseUserData = await kakao.createFirebaseToken(kakaoAccessToken);
    const { firebaseAuthToken, firebaseUserId } = firebaseUserData;
    const kakaoUser = await userDB.getUserByFirebaseId(dbConnection, firebaseUserId);

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

      if (response.status !== 204) {
        return res.status(response.statusCode).send(util.fail(response.statusCode, responseMessage.PUSH_SERVER_ERROR));
      }

      await userDB.updateRefreshToken(dbConnection, kakaoUser.id, refreshToken);

      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGNIN_SUCCESS, 
        { firebaseAuthToken, accessToken, refreshToken, id: kakaoUser.id, nickname }));
    };
  } 
  else {
    // kakaoAccessToken이 없을 때 (!kakaoAccessToken) : 애플 소셜 로그인
    const appleUser = await userDB.getUserByFirebaseId(dbConnection, firebaseUID);

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
      await userDB.updateAppleRefreshToken(dbConnection, appleUser.id, appleRefreshToken);

      const response = await modifyFcmToken(appleUser.mongoUserId, fcmToken);

      if (response.status !== 204) {
        return res.status(response.statusCode).send(util.fail(response.statusCode, responseMessage.PUSH_SERVER_ERROR));
      }

      await userDB.updateRefreshToken(dbConnection, appleUser.id, refreshToken);
      
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGNIN_SUCCESS, 
        { firebaseAuthToken, accessToken, refreshToken, id: appleUser.id, nickname }));
    };
  }
});
