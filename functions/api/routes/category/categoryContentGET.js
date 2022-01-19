const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const slackAPI = require('../../../middlewares/slackAPI');
const db = require('../../../db/db');
const { categoryContentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

/**
 *  @route GET /category/:categoryId
 *  @desc 카테고리 별 콘텐츠 조회
 *  @access Private
 */

module.exports = async (req, res) => {
    const { userId } = req.user;
    const { categoryId } = req.params;
    const { option, filter } = req.query;
    let contents = {};
    let client;

    dayjs().format();
    dayjs.extend(customParseFormat);

    try {
        client = await db.connect(req);
        
        if (option == "all") {
            // 전체 조회
            contents = await categoryContentDB.getAllCategoryContentByFilter(client, userId, categoryId, filter);
            if (filter == "seen_at") {
                // 최근 조회 순 기준인 경우, 조회하지 않은 콘텐츠 제외
                const removedElements = _.remove(contents, function(content) {
                    return content.isSeen === false;
                });
            }
        } else if (option == "notified") {
            // 알림 설정된 콘텐츠만 조회
            contents = await categoryContentDB.getCategoryContentByFilterAndNotified(client, userId, categoryId, true, filter)

        } else {
            // is_seen에 따라 조회
            contents = await categoryContentDB.getCategoryContentByFilterAndSeen(client, userId, categoryId, option, filter);
        }
        if (filter == "reverse") {
            // DESC를 이용했으므로 다시 reverse
            contents = contents.reverse();
        }
        contents.map(obj => {
            /**
             * 클라이언트가 사용할 createdAt, notificationTime, seenAt 은 day js로 format 수정
             * 시간이 null이면 빈 문자열로 수정
             */
            obj.createdAt = dayjs(`${obj.createdAt}`).format("YYYY-MM-DD HH:mm");
            if (obj.notificationTime) {
                obj.notificationTime = dayjs(`${obj.notificationTime}`).format("YYYY-MM-DD HH:mm");
            } else {
                obj.notificationTime = "";
            }
            if (obj.seenAt) {
                obj.seenAt = dayjs(`${obj.seenAt}`).format("YYYY-MM-DD HH:mm");
            } else {
                obj.seenAt = "";
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