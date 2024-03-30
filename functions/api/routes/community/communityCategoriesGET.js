const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { communityDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /community/categories
 *  @desc 커뮤니티 카테고리 조회
 *  @access Public
 */

module.exports = asyncWrapper(async (req, res) => {
  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const communityCategories = await communityDB.getCommunityCategories(dbConnection);

  res.status(statusCode.OK).send(
    util.success(statusCode.OK, responseMessage.READ_COMMUNITY_CATEGORY_SUCCESS, communityCategories),
  );
});