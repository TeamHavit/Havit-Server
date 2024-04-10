const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { communityDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route POST /community/posts
 *  @desc 커뮤니티 게시글 작성
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const {
    communityCategoryIds,
    title,
    body,
    contentUrl,
    contentTitle,
    contentDescription,
    thumbnailUrl,
  } = req.body;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const notExistingCategoryIds = await communityDB.verifyExistCategories(
    dbConnection,
    communityCategoryIds,
  );
  if (notExistingCategoryIds) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_COMMUNITY_CATEGORY));
  }

  const communityPost = await communityDB.addCommunityPost(
    dbConnection,
    userId,
    title,
    body,
    contentUrl,
    contentTitle,
    contentDescription,
    thumbnailUrl,
  );

  await Promise.all(
    communityCategoryIds.map(async (communityCategoryId) => {
      await communityDB.addCommunityCategoryPost(
        dbConnection,
        communityCategoryId,
        communityPost.id,
      );
    }),
  );

  res
    .status(statusCode.CREATED)
    .send(util.success(statusCode.CREATED, responseMessage.ADD_COMMUNITY_POST_SUCCESS));
});
