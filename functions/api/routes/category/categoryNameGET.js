const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { categoryDB } = require('../../../db');
const asyncWrapper = require('../../../lib/asyncWrapper');

/**
 *  @route GET /category/name
 *  @desc 카테고리 이름 조회
 *  @access Private
 */
module.exports = asyncWrapper(async (req, res) => {
    const { userId } = req.user;
    
    const dbConnection = await db.connect(req);
    req.dbConnection = dbConnection;

    const categoryNames = await categoryDB.getCategoryNames(dbConnection, userId);
    const titles = _.map(categoryNames, 'title');
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CATEGORY_NAME_SUCCESS, titles));
});