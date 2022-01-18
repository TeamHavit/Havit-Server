const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');

/**
 *  @route PATCH /content/notification/:contentId
 *  @desc 콘텐츠 알림 시각 수정
 *  @access Private
 */
module.exports = async (req, res) => {
    const { contentId } = req.params;
    const { notificationTime } = req.body;

    if (!notificationTime) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    let client;

    try {
        client = await db.connect(req);
        
        const content = await contentDB.updateContentNotification(client, contentId, notificationTime);
        if (!content) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
        }
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

