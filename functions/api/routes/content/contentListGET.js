const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /content
 *  @desc 콘텐츠 전체 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { option, filter } = req.query;

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  let contents;

  if (option == "all") {
    // 전체 조회
    contents = await contentDB.getContentsByFilter(dbConnection, userId, filter);
  } else if (option == "notified") {
    // 알림 설정된 콘텐츠만 조회
    contents = await contentDB.getContentsByFilterAndNotified(dbConnection, userId, true, filter)
  } else {
    // is_seen에 따라 조회
    contents = await contentDB.getContentsByFilterAndSeen(dbConnection, userId, option, filter);
  }

  if (filter == "reverse") {
    // DESC를 이용했으므로 다시 reverse
    contents = contents.reverse();
  }
  if (filter == "seen_at") {
    // 최근 조회 순 기준인 경우, 조회하지 않은 콘텐츠 제외
    const removedElements = _.remove(contents, function(content) {
      return content.isSeen === false;
    });
  }

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
    if (content.seenAt) {
      content.seenAt = dayjs(`${content.seenAt}`).format("YYYY-MM-DD HH:mm");
    } else {
      content.seenAt = "";
    }
    return content;
  }));

  res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_CONTENT_SUCCESS , result));
});