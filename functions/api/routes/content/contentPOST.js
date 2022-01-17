const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, categoryDB, categoryContentDB } = require('../../../db');

/**
 *  @route POST /content
 *  @desc 콘텐츠 생성
 *  @access Private
 */

module.exports = async (req, res) => {

  const { title, description = '', image = '', url, isNotified, notificationTime = null, categoryIds} = req.body;
  const { userId } = req.user;

  if (!title || !url || !categoryIds) {
      // 필수 데이터가 없을 경우 에러 처리
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;
  
  try {
    client = await db.connect(req);

    const content = await contentDB.addContent(client, userId, title, description, image, url, isNotified, notificationTime);
    for (const categoryId of categoryIds) {
      // 중복 카테고리 허용
      const categoryContent = await categoryContentDB.addCategoryContent(client, categoryId, content.id);
    }
   
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_CONTENT_SUCCESS));
    
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