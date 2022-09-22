const _ = require('lodash');
const functions = require('firebase-functions');
const slackAPI = require('../../../middlewares/slackAPI');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, categoryDB, categoryContentDB } = require('../../../db');

/**
 *  @route GET /content/category/:contentId
 *  @desc 콘텐츠 소속 카테고리 조회
 *  @access Private
 */

module.exports = async (req, res) => {
    const { contentId } = req.params;
    const { userId } = req.user;
    console.log(contentId);
    let client;

    try {
        client = await db.connect(req);

        // 콘텐츠가 없거나, 해당 유저의 콘텐츠가 아닌 경우 제한
        const content = await contentDB.getContentById(client, contentId);
        if(!content) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
        }
        if (content.userId !== userId) {
            return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
        }

        const [allCategories, contentCategories] = await Promise.all([
            categoryDB.getAllCategories(client, userId),
            categoryContentDB.getCategoryContentByContentId(client, contentId, userId)
        ]);

        const data = await Promise.all(allCategories.map(category => {
            category.isSelected = false;

            const result = contentCategories.some(cc => cc.id === category.id);
            if (result) category.isSelected = true;

            return category;
        }));

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CONTENT_CATEGORY_SUCCESS, data));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    
    } finally {
        client.release();
    }
}