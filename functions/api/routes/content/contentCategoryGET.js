const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { contentDB, categoryDB, categoryContentDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /content/category/:contentId
 *  @desc 콘텐츠 소속 카테고리 조회
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { contentId } = req.params;
    const { userId } = req.user;
    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    // 콘텐츠가 없거나, 해당 유저의 콘텐츠가 아닌 경우 제한
    const content = await contentDB.getContentById(dbConnection, contentId);
    if (!content) {
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CONTENT));
    }
    if (content.userId !== userId) {
        return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
    }

    const [allCategories, contentCategories] = await Promise.all([
        categoryDB.getAllCategories(dbConnection, userId),
        categoryContentDB.getCategoryContentByContentId(dbConnection, contentId, userId)
    ]);

    const data = await Promise.all(allCategories.map(category => {
        category.isSelected = false;

        const result = contentCategories.some(cc => cc.id === category.id);
        if (result) category.isSelected = true;

        return category;
    }));

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CONTENT_CATEGORY_SUCCESS, data));
});