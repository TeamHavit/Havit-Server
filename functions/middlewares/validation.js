const { validationResult } = require('express-validator');
const errorHandler = require('../middlewares/errorHandler');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const validatorErrorMessage = errors.array()[1] ? errors.array()[1].msg : errors.array()[1].msg;

  const detailError = {
    statusCode: statusCode.BAD_REQUEST,
    responseMessage: responseMessage.NULL_VALUE,
    validatorErrorMessage,
  };

  errorHandler(detailError, req, res, next);
};

module.exports = { validate };
