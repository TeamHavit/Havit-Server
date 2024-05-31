const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { communityDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route DELETE /community/:communityPostId
 *  @desc 커뮤니티 게시글 삭제
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { communityPostId } = req.params;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const post = await communityDB.getCommunityPostById(dbConnection, communityPostId);
  if (!post) {
    return res
      .status(statusCode.NOT_FOUND)
      .send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_COMMUNITY_POST));
  }
  if (post.userId !== userId) {
    return res
      .status(statusCode.FORBIDDEN)
      .send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
  }

  await communityDB.deleteCommunityPost(dbConnection, communityPostId);

  res
    .status(statusCode.OK)
    .send(util.success(statusCode.OK, responseMessage.DELETE_COMMUNITY_POST_SUCCESS));
});
