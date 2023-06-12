const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route PATCH /category/:categoryId
 *  @desc 카테고리 수정 
 *  @access Private
 */

module.exports = asyncWrapper(async (req, res) => {
    const { categoryId } = req.params;
    const { title, imageId } = req.body;

    if (!title || !imageId) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;
        
    const updatedCategory = await categoryDB.updateCategory(dbConnection, categoryId, title, imageId);
    if (!updatedCategory) {
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_ONE_CATEGORY_SUCCESS));
});

