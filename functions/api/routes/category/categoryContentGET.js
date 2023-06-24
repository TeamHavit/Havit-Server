const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryContentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /category/:categoryId
 *  @desc 카테고리 별 콘텐츠 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { userId } = req.user;
    const { categoryId } = req.params;
    const { option, filter } = req.query;
    let contents = {};
    let dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    dayjs().format();
    dayjs.extend(customParseFormat);

    if (option === "all") {
        // 전체 조회
        contents = await categoryContentDB.getAllCategoryContentByFilter(dbConnection, userId, categoryId, filter);
    } else if (option === "notified") {
        // 알림 설정된 콘텐츠만 조회
        contents = await categoryContentDB.getCategoryContentByFilterAndNotified(dbConnection, userId, categoryId, true, filter)

    } else {
        // is_seen에 따라 조회
        contents = await categoryContentDB.getCategoryContentByFilterAndSeen(dbConnection, userId, categoryId, option, filter);
    }
    if (filter === "reverse") {
        // DESC를 이용했으므로 다시 reverse
        contents = contents.reverse();
    }
    if (filter === "seen_at") {
        // 최근 조회 순 기준인 경우, 조회하지 않은 콘텐츠 제외
        _.remove(contents, function(content) {
            return content.isSeen === false;
        });
    }

    const result = await Promise.all(contents.map(content => {
        /**
         * 클라이언트가 사용할 createdAt, notificationTime, seenAt 은 day js로 format 수정
         * 시간이 null이면 빈 문자열로 수정
         */
        content.createdAt = dayjs(`${content.createdAt}`).format("YYYY-MM-DD HH:mm");
        if (content.notificationTime) {
            content.notificationTime = dayjs(`${content.notificationTime}`).format("YYYY-MM-DD HH:mm");
        } else {
            content.notificationTime = "";
        }
        if (content.seenAt) {
            content.seenAt = dayjs(`${content.seenAt}`).format("YYYY-MM-DD HH:mm");
        } else {
            content.seenAt = "";
        }
        return content;
    }));

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CATEGORY_CONTENT_SUCCESS, result));
});