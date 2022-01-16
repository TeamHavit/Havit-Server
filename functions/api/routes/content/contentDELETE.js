const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, notificationDB, categoryContentDB } = require('../../../db');

module.exports = async (req, res) => {

  const { contentId } = req.params;
  
  if (!contentId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  let client;
  
  try {
    client = await db.connect(req);

    const content = await contentDB.deleteContent(client, contentId);

    if (!content) {
      // 대상 콘텐츠가 없는 경우, 콘텐츠 삭제 실패
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.NO_CONTENT, responseMessage.NO_CONTENT));
    }

    const categoryContent = await categoryContentDB.deleteCategoryContent(client, contentId);

    let notification;
    if (content.isNotified === true) {
      // 알림이 설정되어 있는 경우, 알림도 삭제
      notification = await notificationDB.deleteNotification(client, contentId);
    }

    const result = {
      content : content,
      categoryContent: categoryContent,
      notification: notification
    };
    
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_CONTENT_SUCCESS, result));
    
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