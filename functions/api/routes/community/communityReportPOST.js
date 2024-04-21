const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { communityDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route POST /community/reports
 *  @desc 커뮤니티 게시글 신고
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { communityPostId } = req.body;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const communityPostReport = await communityDB.reportCommunityPost(dbConnection, userId, communityPostId);
  if (!communityPostReport) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_COMMUNITY_POST))
  }
  
  res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.REPORT_COMMUNITY_POST_SUCCESS))
});
