const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { recommendationDB } = require('../../../db');

/**
 *  @route GET /recommendation
 *  @desc 추천 사이트 전체 조회
 *  @access Private
 */

module.exports = async (req, res) => {

    let client;

    try {
        client = await db.connect(req);

        const recommendations = await recommendationDB.getAllRecommendations(client);
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_RECOMMENDATION_SUCCESS, recommendations));

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