const axios = require('axios');
const jwt = require('jsonwebtoken'); 
const functions = require("firebase-functions");
const slackAPI = require("../middlewares/slackAPI");
const fs = require('fs');
const { resolve } = require('path');
const qs = require('qs');

const appleBaseURL = "https://appleid.apple.com";

const privateKey = fs.readFileSync(resolve(__dirname, `../${process.env.APPLE_PRIVATE_KEY_FILE}`), 'utf8');

const header = {
    kid: process.env.APPLE_KEY_ID,
};

const payload = {
    iss: process.env.APPLE_TEAM_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15777000,
    aud: appleBaseURL,
    sub: process.env.APPLE_CLIENT_ID,
};

/**
 *  @desc apple 서버에 refresh token 요청
 *  @param {String} appleCode
 */
const getAppleRefreshToken = async (appleCode) => {
    const clientSecret = jwt.sign(payload, privateKey, {
        algorithm: 'ES256',
        header
    });
    
    const data = {
        'client_id': process.env.APPLE_CLIENT_ID,
        'client_secret': clientSecret,
        'code': appleCode,
        'grant_type': 'authorization_code'
    };

    try {
        const response = await axios.post(`${appleBaseURL}/auth/token`, qs.stringify(data));
        
        return response.data.refresh_token;
    } catch (error) {
        functions.logger.error(`[ERROR] Get Apple Access Token` , `[CONTENT] ${error}`);
        const slackMessage = `[ERROR] Get Apple Access Token ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
        throw error;
    } 
}

/**
 * @desc apple 서버에 소셜 로그인 연결 해지 요청
 * @param {String} appleRefreshToken
 */
const revokeAppleToken = async (appleRefreshToken) => {
    const clientSecret = jwt.sign(payload, privateKey, {
        algorithm: 'ES256',
        header
    });

    const data = {
        'client_id': process.env.APPLE_CLIENT_ID,
        'client_secret': clientSecret,
        'token': appleRefreshToken,
        'token_type_hint': 'refresh_token',
    };

    try {
        await axios.post(`${appleBaseURL}/auth/revoke`, qs.stringify(data));
    } catch (error) {
        functions.logger.error(`[ERROR] Get Apple Access Token`, `[CONTENT] ${error}`);
        const slackMessage = `[ERROR] Get Apple Access Token ${JSON.stringify(error)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
        throw error;
    }
}

module.exports = { getAppleRefreshToken, revokeAppleToken }