const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, categoryContentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /content/recent
 *  @desc 최근 저장 콘텐츠 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {

  const { userId } = req.user;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  const contents = await contentDB.getRecentContents(dbConnection, userId); // 최대 20개까지 조회
  await Promise.all( // 각 콘텐츠가 소속된 카테고리 병렬 탐색
    contents.map(async (content) => {
      let categories = await categoryContentDB.getCategoryContentByContentId(dbConnection, content.id, userId);
      content.firstCategory = categories[0]?.title;
      content.extraCategoryCount = categories.length - 1;
      return;
    })
  );

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

  res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_RECENT_SAVED_CONTENT_SUCCESS, result)); 
});