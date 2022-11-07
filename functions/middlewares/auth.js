const functions = require('firebase-functions');
const jwtHandlers = require('../lib/jwtHandlers');
const db = require('../db/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const slackAPI = require('./slackAPI');
const { userDB } = require('../db');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

const checkUser = async (req, res, next) => {
    // request headers로 전송받은 accessToken
    const accessToken = req.header("x-auth-token");

    // accessToken이 없을 때
    if (!accessToken) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_EMPTY));
    }

    let client;
    try {
        client = await db.connect(req);

        // accessToken 인증 및 해독
        const decodedToken = jwtHandlers.verify(accessToken);

        if (decodedToken === TOKEN_EXPIRED) {
            // 토큰 만료
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
        }
        if (decodedToken === TOKEN_INVALID) {
            // 유효하지 않은 토큰
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
        }

        // 토큰에 담긴 유저 id
        const userId = decodedToken.userId;
        if (!userId) {
            // 토큰에 유저 id가 존재하지 않을 때 (유효하지 않은 토큰)
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
        }

        // 유저 DB에서 해당 유저의 정보 조회
        const user = await userDB.getUser(client, userId);

        if (!user || user.isDeleted) {
            // 해당 유저가 존재하지 않을 때
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_USER));
        }
    
        // 유저 DB로부터 받아 온 유저 정보를 req.user에 담아 다음 미들웨어로 전달
        const returnUser = {
            userId : user.id,
            firebaseId : user.idFirebase,
        }
        req.user = returnUser;
        next();
    } catch (error) {
        console.log(error);
        functions.logger.error(`[AUTH ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, accessToken);
        const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user.userId}` : 'req.user 없음'} ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
        
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } finally {
        client.release();
    }
};

module.exports = { checkUser };