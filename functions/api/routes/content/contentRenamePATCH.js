const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const { modifyContentTitle } = require('../../../lib/pushServerHandlers');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route PATCH /content/title/:contentId
 *  @desc 콘텐츠 제목 변경
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {

  const { contentId } = req.params;
  const { newTitle } = req.body;

  if (!contentId || !newTitle) {
    // 필수 데이터가 없는 경우 에러 처리
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  const dbConnection = await db.connect(req);
  req.dbConnection = dbConnection;

  dayjs().format();
  dayjs.extend(utc);
  dayjs.extend(timezone);

  dayjs.tz.setDefault('Asia/Seoul');

  const content = await contentDB.renameContent(dbConnection, contentId, newTitle);

  if (!content) {
    // 대상 콘텐츠가 없는 경우, 콘텐츠 제목 변경 실패
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
  }

  if (content.isNotified && content.notificationTime > dayjs().tz().$d) {
    const response = await modifyContentTitle(contentId, newTitle);
    if (response.status !== 204) {
      return res.status(res.status).send(util.fail(response.status, responseMessage.PUSH_SERVER_ERROR));
    }
  }

  res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.RENAME_CONTENT_SUCCESS));
});