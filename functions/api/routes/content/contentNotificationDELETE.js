const _ = require('lodash');
const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const { deleteNotification } = require('../../../lib/pushServerHandlers');

/**
 *  @route DELETE /content/:contentId/notification
 *  @desc 콘텐츠 알람 삭제
 *  @access Private
 */

module.exports = async (req, res) => {
    const { userId } = req.user;
    const { contentId } = req.params;

    let client;

    try {
        client = await db.connect(req);

        const content = await contentDB.getContentById(client, contentId);
        if (!content) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
        }
        if (content.userId !== userId) {
            return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
        }

        const response = await deleteNotification(contentId);

        if (response.status !== 200) {
            return res.status(res.status).send(util.fail(response.status, responseMessage.PUSH_SERVER_ERROR));
        }
       
        await contentDB.updateContentNotification(client, contentId, null, false);

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_CONTENT_NOTIFICATION_SUCCESS));
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