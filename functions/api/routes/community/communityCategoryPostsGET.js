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

  const totalItemCount = await communityDB.getCommunityCategoryPostsCount(
    dbConnection,
    userId,
    communityCategoryId,
  ); // 총 게시글 수
  const totalPageCount = Math.ceil(totalItemCount / limit); // 총 페이지 수
  const currentPage = +page; // 현재 페이지
  const isLastPage = totalPageCount === currentPage; // 마지막 페이지인지 여부
  // 요청한 페이지가 존재하지 않는 경우
  if (page > totalPageCount) {
    return res
      .status(statusCode.NOT_FOUND)
      .send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_PAGE));
  }

  const communityCategoryPosts = await communityDB.getCommunityCategoryPostsByCommunityCategoryId(
    dbConnection,
    userId,
    communityCategoryId,
    page,
    limit,
  );
});
