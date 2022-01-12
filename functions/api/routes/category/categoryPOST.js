const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');

module.exports = async (req, res) => {
    const { title, imageId } = req.body;
    if (!title || !imageId) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }
    const { userId } = req.user;

    let client;

    try {
        client = await db.connect(req);

        const oldCategory = await categoryDB.getAllCategories(client, userId);
        const newIndex = oldCategory[oldCategory.length-1].orderIndex + 1; // 새 카테고리 인덱스는 마지막 카테고리 인덱스 + 1
        const category = await categoryDB.addCategory(client, userId, title, imageId, 0, newIndex);
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_CATEGORY_SUCCESS));
    } catch (error) {
        console.log(error);
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    } finally {
        client.release();
    }
};