const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB, categoryContentDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route PATCH /content/category
 *  @desc 콘텐츠 카테고리 변경
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { contentId, newCategoryIds } = req.body;
  const { userId } = req.user;
  
  if (!newCategoryIds.length) {
    // 변경 할 카테고리 id가 없을 때
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  let flag = true; // flag 변수 결과에 따라 categoryContent를 추가할 지, 에러를 보낼 지 결정
  for (const newCategoryId of newCategoryIds) {
    // 카테고리 배열의 id 중 하나라도 유저의 카테고리가 아닐 경우, 에러 전송
    const newCategory = await categoryDB.getCategory(dbConnection, newCategoryId);
    if (!newCategory || newCategory.userId !== userId) {
      // 카테고리가 아예 존재하지 않거나, 해당 유저의 카테고리가 아닌 경우
      flag = false;
    }
  }

  if (flag) {
    // 유저가 해당 카테고리를 가지고 있을 때
    const promises = [];
    promises.push(categoryContentDB.deleteCategoryContentByContentId(dbConnection, contentId)); // 기존 카테고리-콘텐츠 관계 모두 삭제
    for (const newCategoryId of newCategoryIds) {
      // 새로운 카테고리마다 새로운 카테고리-콘텐츠 관계 생성
      promises.push(categoryContentDB.addCategoryContent(dbConnection, newCategoryId, contentId));
    }
    await Promise.all(promises)
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_CONTENT_CATEGORY_SUCCESS));    
  } else {
    // 카테고리를 변경할 수 없는 경우, 에러 전송
    res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
  }
});