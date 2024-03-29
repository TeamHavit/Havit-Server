const util = require('../../../lib/util');
const { createNotification } = require('../../../lib/pushServerHandlers');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, categoryDB, categoryContentDB, userDB } = require('../../../db');
const dotenv = require('dotenv');
const dummyImages = require('../../../constants/dummyImages');
const asyncWrapper = require('../../../lib/asyncWrapper');

dotenv.config();

/**
 *  @route POST /content
 *  @desc 콘텐츠 생성
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {

  const { title, description, url, isNotified, categoryIds } = req.body;
  let { image, notificationTime } = req.body;
  const { userId } = req.user;

  if (!title || !url || !categoryIds) {
      // 필수 데이터가 없을 경우 에러 처리
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (!image) {
    // image url이 없는 경우, 더미 이미지 url로 변경
    image = dummyImages.content_dummy;
  }

  if (!notificationTime) {
    // notificationTime이 빈 문자열로 온 경우, null로 변경
    notificationTime = null;
  }

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const user = await userDB.getUser(dbConnection, userId);
  let flag = true; // flag 변수 결과에 따라 categoryContent를 추가할 지, 에러를 보낼 지 결정
  for (const categoryId of categoryIds) {
    // 카테고리 배열의 id 중 하나라도 유저의 카테고리가 아닐 경우, categoryContent를 추가하지 않고 에러 전송
    const category = await categoryDB.getCategory(dbConnection, categoryId);
    if (!category || category.userId !== userId) {
      // 카테고리가 아예 존재하지 않거나, 해당 유저의 카테고리가 아닌 경우
      flag = false;
    }
  }

  if (flag) {
    // 유저가 해당 카테고리를 가지고 있을 때
    const content = await contentDB.addContent(dbConnection, userId, title, description, image, url, isNotified, notificationTime);
      for (const categoryId of categoryIds) {
        // 중복 카테고리 허용
        await categoryContentDB.addCategoryContent(dbConnection, categoryId, content.id);
      };

      if (user.mongoUserId && content.isNotified) {
        const notificationData = {
          userId: user.mongoUserId,
          contentId: content.id,
          ogTitle: content.title,
          ogImage: content.image,
          url: content.url, 
          time: notificationTime,
          isSeen: false,
        };
        
        const response = await createNotification(notificationData);

        if (response.status !== 201) {
          return res.status(response.status).send(util.fail(response.status, responseMessage.PUSH_SERVER_ERROR));
        }
      }

      res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.ADD_ONE_CONTENT_SUCCESS, { contentId : content.id }));
    
  } else {
    // 유저가 해당 카테고리를 가지고 있지 않을 때
    res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
  }
});