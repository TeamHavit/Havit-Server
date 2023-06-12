const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB } = require('../../../db');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /content/notification?option=
 *  @desc 콘텐츠 알람 전체 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { userId } = req.user;
    const { option } = req.query;

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    dayjs().format()
    dayjs.extend(customParseFormat)

    let contents;

    if (option === 'before') {
        contents = await contentDB.getScheduledContentNotification(dbConnection, userId);
    } else if(option === 'after') {
        contents = await contentDB.getExpiredContentNotification(dbConnection, userId);
    } else {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    const contentList = await Promise.all(contents.map(content => {
        if (content.notificationTime) {
            content.notificationTime = dayjs(`${content.notificationTime}`).format('YYYY-MM-DD HH:mm');
        } else {
            content.notificationTime = '';
        }

        content.createdAt = dayjs(`${content.createdAt}`).format('YYYY-MM-DD');
        return content;
    }));

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CONTENT_NOTIFICATION_SUCCESS, contentList));
});