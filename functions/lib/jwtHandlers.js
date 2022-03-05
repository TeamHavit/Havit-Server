const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

// JWT를 발급/인증할 때 사용할 secretKey, options 설정
const secretKey = process.env.JWT_SECRET;
const options = {
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: process.env.JWT_ACCESS_EXPIRE,
    issuer: 'havit',
};

// id, idFirebase가 담긴 JWT를 발급
const sign = (user) => {
    const payload = {
        userId: user.id,
        idFirebase: user.idFirebase,
    };

    const accessToken =  jwt.sign(payload, secretKey, options);
    return accessToken;
};

// JWT를 해독해 우리가 만든 JWT가 맞는지 확인 (인증)
const verify = (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch (err) {
        if (err.message === 'jwt expired') {
            console.log('expired token');
            functions.logger.error('expired token');
            return TOKEN_EXPIRED;
        } else if (err.message === 'invalid token') {
            console.log('invalid token');
            functions.logger.error('invalid token');
            return TOKEN_INVALID;
        } else {
            console.log('invalid token');
            functions.logger.error('invalid token');
            return TOKEN_INVALID;
        }
    }
    // 해독 / 인증이 완료된 JWT 반환
    return decoded;
};

module.exports = {
    sign,
    verify,
};