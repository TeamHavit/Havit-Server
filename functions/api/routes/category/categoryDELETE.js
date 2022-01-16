const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryDB, categoryContentDB, contentDB } = require('../../../db');

/**
 *  @route DELETE /category/:categoryId
 *  @desc 카테고리 삭제
 *  @access Private
 */
module.exports = async (req, res) => {
    const { categoryId } = req.params;

    let client;

    try {
        client = await db.connect(req);

        await categoryDB.deleteCategory(client, categoryId); // 해당 카테고리 soft delete
        await contentDB.updateContentIsDeleted(client, categoryId); // 카테고리 개수가 1개 (해당 카테고리뿐)인 콘텐츠 soft delete
        await categoryContentDB.deleteCategoryContentByCategoryId(client, categoryId); // category_content 테이블 내 해당 카테고리 삭제

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_ONE_CATEGORY_SUCCESS));
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