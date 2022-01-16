const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryContentDB } = require('../../../db');

/**
 *  @route PATCH /content/category
 *  @desc 콘텐츠 카테고리 변경
 *  @access Private
 */

module.exports = async (req, res) => {
  const { contentId, newCategoryIds } = req.body;
  const { userId } = req.user;
  
  if (!newCategoryIds.length) {
    // 변경 할 카테고리 id가 없을 때
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  let client;
  
  try {
    client = await db.connect(req);

    const deletedCategoryIds = await categoryContentDB.deleteCategoryContentByContentId(client, contentId); // 기존 카테고리-콘텐츠 관계 모두 삭제

    for (var newCategoryId of newCategoryIds) {
        // 새로운 카테고리마다 새로운 카테고리-콘텐츠 관계 생성
        const newCategoryContent = await categoryContentDB.addCategoryContent(client, newCategoryId, contentId);
    }
    
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CHANGE_CONTENT_CATEGORY_SUCCESS));
    
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    
  } finally {
    client.release();
  }
};