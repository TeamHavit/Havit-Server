const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');

/**
 *  @route POST /category
 *  @desc 카테고리 생성
 *  @access Private
 */

module.exports = async (req, res) => {
    const { title, imageId } = req.body;
    let newIndex = 0;

    if (!title || !imageId) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }
    const { userId } = req.user;

    let client;

    try {
        client = await db.connect(req);

        const oldCategory = await categoryDB.getAllCategories(client, userId);

        if(oldCategory.length) {
            newIndex = oldCategory[oldCategory.length - 1].orderIndex + 1; // 새 카테고리 인덱스는 마지막 카테고리 인덱스 + 1
        }
        await categoryDB.addCategory(client, userId, title, imageId, newIndex);
        res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.ADD_ONE_CATEGORY_SUCCESS));
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