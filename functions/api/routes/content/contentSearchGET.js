const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')

/**
 *  @route GET /content/search?keyword=
 *  @desc 전체 콘텐츠 키워드 검색
 *  @access Private
 */

module.exports = async (req, res) => {

  const { keyword } = req.query; 
  const { userId } = req.user;

  if (!keyword) {
    // 검색 키워드가 없을 때 에러 처리
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;
  
  try {
    client = await db.connect(req);

    const contents = await contentDB.searchContent(client, userId, keyword);

    dayjs().format()
    dayjs.extend(customParseFormat)

    const result = await Promise.all(contents.map(content => {
      // 시간 데이터 dayjs로 format 수정
      content.createdAt = dayjs(`${content.createdAt}`).format("YYYY-MM-DD HH:mm"); // createdAt 수정
      if (content.notificationTime) {
        // notificationTime이 존재할 경우, format 수정
        content.notificationTime = dayjs(`${content.notificationTime}`).format("YYYY-MM-DD HH:mm");
      } else {
        // notificationTime이 존재하지 않는 경우, null을 빈 문자열로 변경
        content.notificationTime = "";
      }
      return content;
    }));

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.KEYWORD_SEARCH_CONTENT_SUCCESS, result));
    
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
    
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    
  } finally {
    client.release();
  }
};