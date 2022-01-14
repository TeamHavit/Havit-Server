const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryContentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

module.exports = async (req, res) => {
    const { userId } = req.user;
    const categoryId = req.params.categoryId;
    const { seen, filter } = req.query;
    let contents = {};
    let client;

    dayjs().format();
    dayjs.extend(customParseFormat);

    try {
        client = await db.connect(req);
        
        if (seen == "all") {
            // 전체 조회
            contents = await categoryContentDB.getAllCategoryContentByFilter(client, userId, categoryId, filter);
        } else {
            // is_seen에 따라 조회
            contents = await categoryContentDB.getCategoryContentByFilterAndSeen(client, userId, categoryId, seen, filter);
        }
        if (filter == "reverse") {
            // filter가 과거순일 경우 created_at 기준 reverse
            contents = contents.reverse();
        }
        contents.map(obj => {
            /**
             * 클라이언트가 사용할 createdAt, notificationTime 은 day js로 format 수정
             * is_notified = null 이면 빈 문자열로 수정
             */
            obj.createdAt = dayjs(`${obj.createdAt}`).format("YYYY-MM-DD hh:mm");
            if (obj.notificationTime) {
                obj.notificationTime = dayjs(`${obj.notificationTime}`).format("YYYY-MM-DD hh:mm");
            } else {
                obj.notificationTime = "";
            }
        });
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CATEGORY_CONTENT_SUCCESS, contents));
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