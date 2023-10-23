const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB, categoryContentDB, contentDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route DELETE /category/:categoryId
 *  @desc 카테고리 삭제
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { categoryId } = req.params;
    const { userId } = req.user;

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    const category = await categoryDB.getCategory(dbConnection, categoryId);
    if (!category) {
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
    }
    if (category.userId !== userId) {
        return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
    }

    await Promise.all([
        categoryDB.deleteCategory(dbConnection, categoryId, userId), // 해당 카테고리 soft delete
        contentDB.updateContentIsDeleted(dbConnection, categoryId, userId), // 카테고리 개수가 1개 (해당 카테고리뿐)인 콘텐츠 soft delete
        categoryContentDB.deleteCategoryContentByCategoryId(dbConnection, categoryId) // category_content 테이블 내 해당 카테고리 삭제
    ])

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_ONE_CATEGORY_SUCCESS));
});