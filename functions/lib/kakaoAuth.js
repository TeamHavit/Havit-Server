const util = require('./util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const request = require('request-promise');
const firebaseAdmin = require('firebase-admin');
const { res } = require('express');
const requestMeUrl = 'https://kapi.kakao.com/v2/user/me?secure_resource=true';

/**
 *  @desc Kakao 서버에 유저 프로필 정보 요청
 *  @param {String} KakaoAccessToken
 */
const requestMe = async (kakaoAccessToken) => {
  return request({
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + kakaoAccessToken},
    url: requestMeUrl,
  });
};

/**
 *  @desc Firebase Auth에 유저 업데이트. 존재하지 않는 유저일 경우 유저 생성
 *  @param  {String} userId
 *  @param  {String} email
 *  @param  {String} displayName
 *  @param  {String} photoURL
 */
const updateOrCreateUser = async (userId, email, displayName, photoURL) => {
  const updateParams = {
    provider: 'KAKAO',
    email,
    displayName,
  };
  if (displayName) {
    updateParams['displayName'] = displayName;
  } else {
    updateParams['displayName'] = email;
  }
  if (photoURL) {
    updateParams['photoURL'] = photoURL;
  }

  return firebaseAdmin.auth().updateUser(userId, updateParams) // 유저 존재하는 경우, 업데이트
  .catch((error) => {
    if (error.code === 'auth/user-not-found') {
      updateParams['uid'] = userId;
      if (email) {
        updateParams['email'] = email;
      }
      return firebaseAdmin.auth().createUser(updateParams); // 유저 존재하지 않는 경우, 생성
    }
    throw error;
  });
};

/**
 *  @desc Firebase Token 생성
 *  @param {String} KakaoAccessToken
 */
const createFirebaseToken = async (kakaoAccessToken) => {
  const kakaoUser = await requestMe(kakaoAccessToken); // Kakao 유저 정보
  const kakaoUserData = JSON.parse(kakaoUser);
  const KakaoUserId = `kakao:${kakaoUserData.id}`; // Kakao 고유 ID
  if (!KakaoUserId) {
    // 해당 Kakao Access Token에 해당하는 Kakao 유저가 존재하지 않을 때
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.TOKEN_INVALID));
  }
  let nickname = null;
  let profileImage = null;
  const email =  kakaoUserData.kakao_account.email;
  if (kakaoUserData.kakao_account) {
    nickname = kakaoUserData.kakao_account.profile.nickname;
    profileImage = kakaoUserData.kakao_account.profile.profile_image_url;
  }

  const firebaseUser = await updateOrCreateUser(KakaoUserId, email, nickname, profileImage); // Kakao 유저 정보를 가지고 있는 Firebase 유저
  const firebaseUserId = firebaseUser.uid;

  const firebaseUserData = {
    'firebaseAuthToken' : await firebaseAdmin.auth().createCustomToken(firebaseUserId, {provider: 'KAKAO'}),
    'firebaseUserId' : firebaseUserId,
    'nickname' : nickname,
    'email' : email,
  }
  return firebaseUserData;
};

module.exports = { requestMe, updateOrCreateUser, createFirebaseToken };