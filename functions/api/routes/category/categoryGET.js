const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB, categoryContentDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /category
 *  @desc 카테고리 전체 조회
 *  @access Private
 */
module.exports = asyncWrapper(async (req, res) => {
    const { userId } = req.user;

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    let categories = await categoryDB.getAllCategories(dbConnection, userId);
    for (let category of categories) {
        const categoryContent = await categoryContentDB.getAllCategoryContentByFilter(dbConnection, userId, category.id, 'created_at');
        category.contentNumber = categoryContent.length;
    }
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CATEGORY_SUCCESS, categories));
}); 
