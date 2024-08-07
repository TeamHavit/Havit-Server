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
 *  @route GET /community/categories/:communityCategoryId
 *  @desc 커뮤니티 카테고리별 게시글 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { page, limit } = req.query;
  const { communityCategoryId } = req.params;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  dayjs().format();
  dayjs.extend(customParseFormat);

  // category id가 존재하지 않는 경우
  const isExistingCategory = await communityDB.isExistingCategory(
    dbConnection,
    communityCategoryId,
  );
  if (!isExistingCategory) {
    return res
      .status(statusCode.NOT_FOUND)
      .send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
  }

  const totalItemCount = await communityDB.getCommunityCategoryPostsCount(
    dbConnection,
    userId,
    communityCategoryId,
  );
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
  const communityCategoryPosts = await communityDB.getCommunityCategoryPostsById(
    dbConnection,
    userId,
    communityCategoryId,
    limit,
    offset,
  );
  // 각 게시글의 createdAt 형식 변경 및 프로필 이미지 추가
  const result = await Promise.all(
    communityCategoryPosts.map((communityPost) => {
      communityPost.createdAt = dayjs(`${communityPost.createdAt}`).format('YYYY. MM. DD');
      communityPost.profileImage = dummyImages.user_profile_dummy;
      return communityPost;
    }),
  );

  res.status(statusCode.OK).send(
    util.success(statusCode.OK, responseMessage.READ_COMMUNITY_CATEGORY_POSTS_SUCCESS, {
      posts: result,
      currentPage,
      totalPageCount,
      totalItemCount,
      isLastPage: currentPage === totalPageCount,
    }),
  );
});
