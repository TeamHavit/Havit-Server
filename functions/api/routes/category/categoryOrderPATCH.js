const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');

/**
 *  @route PATCH /category/order
 *  @desc 카테고리 순서 변경
 *  @access Private
 */

module.exports = async (req, res) => {
    const { categoryIndexArray } = req.body;
    const { userId } = req.user;

    if (!categoryIndexArray) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    let client;

    try {
        client = await db.connect(req);
        
        for (let orderIndex = 0; orderIndex < categoryIndexArray.length; orderIndex++) {
            // 카테고리 배열 속 카테고리 id의 순서대로 변경
            const contentId = categoryIndexArray[orderIndex];
            const updatedCategory = await categoryDB.updateCategoryIndex(client, userId, contentId, orderIndex);
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_CATEGORY_ORDER_SUCCESS));
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

