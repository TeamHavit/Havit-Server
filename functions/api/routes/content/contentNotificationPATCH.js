const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, userDB } = require('../../../db');
const { modifyNotificationTime, createNotification } = require('../../../lib/pushServerHandlers');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route PATCH /content/:contentId/notification
 *  @desc 콘텐츠 알림 시각 수정
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { contentId } = req.params;
    const { notificationTime } = req.body;
    const { userId } = req.user;

    if (!notificationTime) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    let response; 

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

    const user = await userDB.getUser(dbConnection, userId);

    if (content.notificationTime && content.notificationTime > dayjs().tz().$d) {
        response = await modifyNotificationTime(contentId, notificationTime);
    } else {
        const data = {
            userId: user.mongoUserId,
            time: notificationTime,
            ogTitle: content.title,
            ogImage: content.image,
            url: content.url,
            isSeen: content.isSeen,
            contentId
        };
        response = await createNotification(data);
    }
    if (response.status !== 200 && response.status !== 201) {
        return res.status(response.status).send(util.fail(response.status, responseMessage.PUSH_SERVER_ERROR));
    }

    await contentDB.updateContentNotification(dbConnection, contentId, notificationTime, true);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_CONTENT_NOTIFICATION_SUCCESS));
});

