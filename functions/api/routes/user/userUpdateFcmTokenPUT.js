const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const { default: axios } = require('axios');
const { modifyFcmToken } = require('../../../lib/pushServerHandlers');

module.exports = async (req, res) => {
    const { fcmToken } = req.body;
    const { userId } = req.user;

    if (!fcmToken) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }
    
    let client;

    try {
        client = await db.connect(req);

        const user = await userDB.getUser(client, userId);

        if (!user.mongoUserId) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NOT_FOUND));
        }

        const response = await modifyFcmToken(user.mongoUserId, fcmToken);

        if (response.status != 204) {
            return res.status(response.statusCode).send(util.fail(response.statusCode, response.statusText));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_FCM_TOKEN_SUCCESS));

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