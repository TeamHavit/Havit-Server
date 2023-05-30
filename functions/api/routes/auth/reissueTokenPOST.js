const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../../../constants/jwt');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route POST /auth/reissue
 *  @desc 토큰 재발급
 *  @access Public
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.body;
  const refreshToken = req.header("refresh-token");

  const decodedToken = jwtHandlers.verify(refreshToken);
    if (decodedToken === TOKEN_EXPIRED) {
      // 토큰 만료
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
    }
    if (decodedToken === TOKEN_INVALID) {
      // 유효하지 않은 토큰
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
    }
    // 토큰 만료, 유효하지 않은 토큰 모두 강제 로그아웃 필요함

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;
  const user = await userDB.getUser(dbConnection, userId);

  // DB user 테이블의 Refresh Token과 클라이언트에게 받아 온 Refresh Token 비교
  if (refreshToken == user.refreshToken) {
    // Refresh Token 일치 : Aceess Token, Refresh Token 재발급, DB 업데이트
    const newAccessToken = jwtHandlers.sign(user);
    const newRefreshToken = jwtHandlers.signRefresh();
    await userDB.updateRefreshToken(dbConnection, user.id, newRefreshToken);
    const reissuedTokens = {
        'accessToken' : newAccessToken,
        'refreshToken' : newRefreshToken
    };
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.TOKEN_REISSUE_SUCCESS, reissuedTokens));
  }
  else {
    // Refresh Token 불일치 : 강제 로그아웃
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
  }
});