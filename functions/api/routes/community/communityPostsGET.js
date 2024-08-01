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
  const { userId } = req.user;
  const { page, limit } = req.query;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  dayjs().format();
  dayjs.extend(customParseFormat);

  const totalItemCount = await communityDB.getCommunityPostsCount(dbConnection, userId); // 총 게시글 수
  const totalPageCount = Math.ceil(totalItemCount / limit);
  const currentPage = +page;

  // 게시글이 없는 경우
  if (totalItemCount === 0) {
    return res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.NO_COMMUNITY_POST));
  }

  // 요청한 페이지가 존재하지 않는 경우
  if (page > totalPageCount) {
    return res
      .status(statusCode.NOT_FOUND)
      .send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_PAGE));
  }

  const offset = (page - 1) * limit;
  const communityPosts = await communityDB.getCommunityPosts(dbConnection, userId, limit, offset);

  // 각 게시글의 createdAt 형식 변경, 프로필 이미지 추가, 썸네일 이미지 null일 경우 대체 이미지 추가
  const result = await Promise.all(
    communityPosts.map((communityPost) => {
      communityPost.createdAt = dayjs(`${communityPost.createdAt}`).format('YYYY. MM. DD');
      communityPost.profileImage = dummyImages.user_profile_dummy;
      communityPost.thumbnailUrl = communityPost.thumbnailUrl || dummyImages.content_dummy;
      return communityPost;
    }),
  );

  res.status(statusCode.OK).send(
    util.success(statusCode.OK, responseMessage.READ_COMMUNITY_POSTS_SUCCESS, {
      posts: result,
      currentPage,
      totalPageCount,
      totalItemCount,
      isLastPage: currentPage === totalPageCount,
    }),
  );
});
