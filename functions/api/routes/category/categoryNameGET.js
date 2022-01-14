const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');

/**
 *  @route GET /category/name
 *  @desc 카테고리 이름 조회
 *  @access Private
 */
module.exports = async (req, res) => {
    const { userId } = req.user;
    
    let client;
    
    try {
        client = await db.connect(req);
        const categoryNames = await categoryDB.getCategoryNames(client, userId);
        const titles = _.map(categoryNames, 'title');
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CATEGORY_NAME_SUCCESS, titles));
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