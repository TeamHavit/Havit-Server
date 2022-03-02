const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const kakao = require('../../../middlewares/kakaoAuth');
const { response } = require('express');

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
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.KAKAO_LOGIN_SUCCESS));
};