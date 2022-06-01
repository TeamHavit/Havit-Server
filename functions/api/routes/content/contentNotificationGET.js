const _ = require('lodash');
const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')

/**
 *  @route GET /content/notification?option=
 *  @desc 콘텐츠 알람 전체 조회
 *  @access Private
 */

module.exports = async (req, res) => {
    const { userId } = req.user;
    const { option } = req.query;

    let client;

    dayjs().format()
    dayjs.extend(customParseFormat)

    try {
        client = await db.connect(req);
        
        let contents;

        if (option === 'before') {
            contents = await contentDB.getScheduledContentNotification(client, userId);
        } else if(option === 'after') {
            contents = await contentDB.getExpiredContentNotificaion(client, userId);
        } else {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
        }

        const contentList = await Promise.all(contents.map(content => {
            if (content.notificationTime) {
                content.notificationTime = dayjs(`${content.notificationTime}`).format('YYYY-MM-DD HH:mm');
            } else {
                content.notificationTime = '';
            }

            content.createdAt = dayjs(`${content.createdAt}`).format('YYYY-MM-DD');
            return content;
        }));

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CONTENT_NOTIFICATION_SUCCESS, contentList));

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