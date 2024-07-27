const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const dummyImages = require('../../../constants/dummyImages');
const db = require('../../../db/db');
const { communityDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /community/posts/:communityPostId
 *  @desc 커뮤니티 게시글 상세 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { communityPostId } = req.params;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const isReportedPost = await communityDB.getReportedPostByUser(
    dbConnection,
    userId,
    communityPostId,
  );
  if (isReportedPost) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_REPORTED_POST));
  }

  dayjs().format();
  dayjs.extend(customParseFormat);

  const communityPost = await communityDB.getCommunityPostDetail(
    dbConnection,
    communityPostId,
    userId,
  );
  if (!communityPost) {
    return res
      .status(statusCode.NOT_FOUND)
      .send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_COMMUNITY_POST));
  }

  communityPost.createdAt = dayjs(`${communityPost.createdAt}`).format('YYYY. MM. DD');
  communityPost.thumbnailUrl = communityPost.thumbnailUrl || dummyImages.content_dummy;

  res.status(statusCode.OK).send(
    util.success(statusCode.OK, responseMessage.READ_COMMUNITY_POST_SUCCESS, {
      ...communityPost,
      profileImage: dummyImages.user_profile_dummy,
    }),
  );
});
