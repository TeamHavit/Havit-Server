const functions = require('firebase-functions');
const slackAPI = require('./slackAPI');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

module.exports = (error, req, res, next) => {
  const errorStatusCode = error.statusCode ? error.statusCode : statusCode.INTERNAL_SERVER_ERROR;
  const errorResponseMessage = error.responseMessage ? error.responseMessage : responseMessage.INTERNAL_SERVER_ERROR;
  functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
  console.log(error);
  const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
  slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);

  res.status(errorStatusCode).send(util.fail(errorStatusCode, errorResponseMessage));
}