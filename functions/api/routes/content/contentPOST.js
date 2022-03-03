const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, categoryDB, categoryContentDB, userDB } = require('../../../db');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
/**
 *  @route POST /content
 *  @desc 콘텐츠 생성
 *  @access Private
 */

module.exports = async (req, res) => {

  const { title, description = '', image = '', url, isNotified, categoryIds } = req.body;
  let { notificationTime } = req.body; // notificationTime 없는 경우, 클라이언트에서 빈 문자열로 제공
  const { userId } = req.user;

  if (!title || !url || !categoryIds) {
      // 필수 데이터가 없을 경우 에러 처리
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (notificationTime == "") {
    // notificationTime이 빈 문자열로 온 경우, null로 변경
    notificationTime = null;
  }

  let client;
  
  try {
    client = await db.connect(req);
    const user = await userDB.getUser(client, userId);
    let flag = true; // flag 변수 결과에 따라 categoryContent를 추가할 지, 에러를 보낼 지 결정
    for (const categoryId of categoryIds) {
      // 카테고리 배열의 id 중 하나라도 유저의 카테고리가 아닐 경우, categoryContent를 추가하지 않고 에러 전송
      const category = await categoryDB.getCategory(client, categoryId);
      if (!category || category.userId !== userId) {
        // 카테고리가 아예 존재하지 않거나, 해당 유저의 카테고리가 아닌 경우
        flag = false;
      }
    }

    if (flag) {
      // 유저가 해당 카테고리를 가지고 있을 때
      const content = await contentDB.addContent(client, userId, title, description, image, url, isNotified, notificationTime);
      for (const categoryId of categoryIds) {
        // 중복 카테고리 허용
        const categoryContent = await categoryContentDB.addCategoryContent(client, categoryId, content.id);
      }
      const data = {
        contentId: content.id
      };

      if (user.mongoUserId && content.isNotified) {
        // 데모데이용 알림 생성 -> 릴리즈때 수정 필요
        let date = new Date(content.notificationTime);
        date = date.setHours(date.getHours()-9);
        const notification = await axios.post(process.env.PUSH_SERVER_URL+"reminder", {
            userId: user.mongoUserId, 
            contentId: content.id,
            time: date,
            ogTitle: content.title,
            ogImage: content.image,
            url: content.url
        });
      }
      res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.ADD_ONE_CONTENT_SUCCESS, data));
    } else {
      // 유저가 해당 카테고리를 가지고 있지 않을 때
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
    }

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