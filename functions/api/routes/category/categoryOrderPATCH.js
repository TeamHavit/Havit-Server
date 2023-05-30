const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route PATCH /category/order
 *  @desc 카테고리 순서 변경
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { categoryIndexArray } = req.body;
    const { userId } = req.user;

    if (!categoryIndexArray) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    let dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;
        
    for (let orderIndex = 0; orderIndex < categoryIndexArray.length; orderIndex++) { // TODO: 비동기 처리
        // 카테고리 배열 속 카테고리 id의 순서대로 변경
        const contentId = categoryIndexArray[orderIndex];
        await categoryDB.updateCategoryIndex(dbConnection, userId, contentId, orderIndex);
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_CATEGORY_ORDER_SUCCESS));
});

