const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const { deleteNotification } = require('../../../lib/pushServerHandlers');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const asyncWrapper = require('../../../lib/asyncWrapper');


/**
 *  @route DELETE /content/:contentId/notification
 *  @desc 콘텐츠 알람 삭제
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { userId } = req.user;
    const { contentId } = req.params;

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    dayjs().format();
    dayjs.extend(utc);
    dayjs.extend(timezone);

    dayjs.tz.setDefault('Asia/Seoul');

    const content = await contentDB.getContentById(dbConnection, contentId);
    if (!content) {
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
    }
    if (content.userId !== userId) {
        return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
    }
    if (!content.isNotified) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    if (content.notificationTime > dayjs().tz().$d) {
        // 알림 예정 일 때 푸시서버에서도 삭제
        const response = await deleteNotification(contentId);

        if (response.status !== 200) {
            return res.status(res.status).send(util.fail(response.status, responseMessage.PUSH_SERVER_ERROR));
        }
    }

    await contentDB.updateContentNotification(dbConnection, contentId, null, false);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_CONTENT_NOTIFICATION_SUCCESS));
});