const util = require("../../../lib/util");
const statusCode = require("../../../constants/statusCode");
const responseMessage = require("../../../constants/responseMessage");
const kakao = require("../../../lib/kakaoAuth");
const db = require("../../../db/db");
const { userDB } = require("../../../db");
const jwtHandlers = require("../../../lib/jwtHandlers");
const { createPushServerUser } = require("../../../lib/pushServerHandlers");
const { getAppleRefreshToken } = require("../../../lib/appleAuth");
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route POST /auth/signup
 *  @desc 신규 유저 회원가입
 *  @access Public
 */

module.exports = asyncWrapper(async (req, res) => {
  const { fcmToken, kakaoAccessToken, firebaseUID, appleCode, nickname, email, age, gender, isOption } = req.body;

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
  const mongoId = await createPushServerUser(fcmToken);

  if (!firebaseUID) {
    // firebaseUID가 없을 때 : 카카오 소셜 로그인
    const firebaseUserData = await kakao.createFirebaseToken(kakaoAccessToken);
    const { firebaseAuthToken, firebaseUserId } = firebaseUserData;
    const refreshToken = jwtHandlers.signRefresh();
    const kakaoUser = await userDB.addUser(dbConnection, firebaseUserId, nickname, email, age, gender, isOption, mongoId, refreshToken);
    const accessToken = jwtHandlers.sign({ id: kakaoUser.id, idFirebase: kakaoUser.idFirebase });
    return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.SIGNUP_SUCCESS, { firebaseAuthToken, accessToken, refreshToken, id: kakaoUser.id, nickname }));
  } 
  else {
    // kakaoAccessToken이 없을 때 (!kakaoAccessToken) : 애플 소셜 로그인
      const refreshToken = jwtHandlers.signRefresh();
    const appleUser = await userDB.addUser(dbConnection, firebaseUID, nickname, email, age, gender, isOption, mongoId, refreshToken);
    const accessToken = jwtHandlers.sign({ id: appleUser.id, idFirebase: appleUser.idFirebase });
    const firebaseAuthToken = "";

    // apple refresh token 발급
    const appleRefreshToken = await getAppleRefreshToken(appleCode);
    await userDB.updateAppleRefreshToken(dbConnection, appleUser.id, appleRefreshToken);

    return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.SIGNUP_SUCCESS, { firebaseAuthToken, accessToken, refreshToken, id: appleUser.id, nickname }));
  }
});
