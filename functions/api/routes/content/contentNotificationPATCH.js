const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { contentDB, userDB } = require('../../../db');
const { modifyNotificationTime, createNotification } = require('../../../lib/pushServerHandlers');

/**
 *  @route PATCH /content/:contentId/notification
 *  @desc 콘텐츠 알림 시각 수정
 *  @access Private
 */

module.exports = async (req, res) => {
    const { contentId } = req.params;
    const { notificationTime } = req.body;
    const { userId } = req.user;

    if (!notificationTime) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    let client;
    let response; 

    try {
        client = await db.connect(req);
        
        const content = await contentDB.getContentById(client, contentId);
        if (!content) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
        }
        if (content.userId !== userId) {
            return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
        }

        const user = await userDB.getUser(client, userId);

        if (content.notificationTime) {
            response = await modifyNotificationTime(contentId, notificationTime);
        } else {
            const data = {
                userId: user.mongoUserId,
                time: notificationTime,
                ogTitle: content.title,
                ogImage: content.image,
                url: content.url,
                contentId
            };
            response = await createNotification(data);
        }
        if (response.status !== 200 && response.status !== 201) {
            return res.status(response.status).send(util.fail(response.status, responseMessage.PUSH_SERVER_ERROR));
        }

        await contentDB.updateContentNotification(client, contentId, notificationTime);

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_CONTENT_NOTIFICATION_SUCCESS));
    } catch (error) {
        console.log(error);
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } finally {
        client.release();
    }
};

