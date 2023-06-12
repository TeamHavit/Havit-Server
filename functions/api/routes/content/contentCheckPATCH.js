const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route PATCH /content/check
 *  @desc 콘텐츠 조회 여부 토글
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {

  const { contentId } = req.body
  
  if (!contentId) {
    // 콘텐츠 id가 없을 때
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const content = await contentDB.toggleContent(dbConnection, contentId);

  if (!content) {
    // 특정 콘텐츠 id를 가진 콘텐츠가 존재하지 않을 때
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
  }
  
  res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.TOGGLE_CONTENT_SUCCESS, content));
});