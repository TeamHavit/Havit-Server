const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require("../../../db");
const { getAuth } = require('firebase-admin/auth');
const { nanoid } = require("nanoid");
const { deletePushUser } = require('../../../lib/pushServerHandlers');
const { revokeAppleToken } = require('../../../lib/appleAuth');
const asyncWrapper = require('../../../lib/asyncWrapper');


/**
 *  @route DELETE /auth/user
 *  @desc 회원 탈퇴
 *  @access Public
 */

module.exports = asyncWrapper(async (req, res) => {

  const { userId } = req.user;
  const dbConnection = await db.connect(req);
  let deleteUser = await userDB.getUser(dbConnection, userId); // DB에서 해당 유저 정보 받아 옴
  if (deleteUser.appleRefreshToken) {
    await revokeAppleToken(deleteUser.appleRefreshToken); // 애플 유저라면 애플 계정 연동 해지
  }

  try {
    // 500 INTERNAL SERVER ERROR가 아닌 경우에만 error에 부가 정보 삽입
    await getAuth().deleteUser(deleteUser.idFirebase); // Firebase Auth에서 해당 유저 삭제
  } catch (error) {
    if (error.errorInfo.code === 'auth/user-not-found') {
      // Firebase Auth에 해당 유저 존재하지 않을 경우 : 404 NOT FOUND
      error.statusCode = statusCode.NOT_FOUND;
      error.responseMessage = responseMessage.NO_USER;
    }
    throw error;
  }

  const randomString = `:${nanoid(10)}`;
  await userDB.deleteUser(dbConnection, userId, randomString); // DB에서 해당 유저 삭제

  const response = await deletePushUser(deleteUser.mongoUserId);
  if (response.status !== 204) {
    // 푸시 서버 에러 발생 시 푸시 서버 에러임을 명시
    const pushServerError = new Error();
    pushServerError.statusCode = response.statusCode;
    pushServerError.responseMessage = response.statusText;
    throw pushServerError;
  }

  res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_USER));
});