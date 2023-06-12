const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');


/**
 *  @route POST /category
 *  @desc 카테고리 생성
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { title, imageId } = req.body;
    let newIndex = 0;

    if (!title || !imageId) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }
    const { userId } = req.user;

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    const oldCategory = await categoryDB.getAllCategories(dbConnection, userId);

    if(oldCategory.length) {
        newIndex = oldCategory[oldCategory.length - 1].orderIndex + 1; // 새 카테고리 인덱스는 마지막 카테고리 인덱스 + 1
    }
    await categoryDB.addCategory(dbConnection, userId, title, imageId, newIndex);
    res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, responseMessage.ADD_ONE_CATEGORY_SUCCESS));
});