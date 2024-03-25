const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const asyncWrapper = require('../../../lib/asyncWrapper');
const db = require('../../../db/db');
const { communityDB } = require('../../../db');
const dummyImages = require('../../../constants/dummyImages');

/**
 *  @route GET /community/posts
 *  @desc 커뮤니티 게시글 전체 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { page, limit } = req.query;
  if (!page || !limit) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // db 연결
  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  dayjs().format();
  dayjs.extend(customParseFormat);

  const totalItemCount = await communityDB.getCommunityPostsCount(dbConnection);
  const totalPageCount = Math.ceil(totalItemCount / limit);
  const isLastPage = totalPageCount === page;
  if (page > totalPageCount) {
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_PAGE));
  }

  const communityPosts = await communityDB.getCommunityPosts(dbConnection, limit, page);
  const result = await Promise.all(
    communityPosts.map((communityPost) => {
      communityPost.createdAt = dayjs(`${communityPost.createdAt}`).format('YYYY. MM. DD');
      communityPost.profileImage = dummyImages.user_profile_dummy;
      return communityPost;
    }),
  );

  res.status(statusCode.OK).send(
    util.success(statusCode.OK, responseMessage.READ_COMMUNITY_POSTS_SUCCESS, {
      posts: result,
      currentPage: page,
      totalPageCount,
      totalItemCount,
      isLastPage,
    }),
  );
});
