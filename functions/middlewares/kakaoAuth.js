const request = require('request-promise');
const firebaseAdmin = require('firebase-admin');
const { response } = require('express');
const requestMeUrl = 'https://kapi.kakao.com/v2/user/me?secure_resource=true';

/**
 *  @desc Kakao API에 유저 프로필 요청
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
    displayName: displayName,
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
}

// /**
//  * createFirebaseToken - returns Firebase token using Firebase Admin SDK
//  *
//  * @param  {String} kakaoAccessToken access token from Kakao Login API
//  * @return {Promise<String>}                  Firebase token in a promise
//  */
// function createFirebaseToken(kakaoAccessToken) {
//   return requestMe(kakaoAccessToken).then((response) => {
//     console.log('requestMe Finished');
//     const body = JSON.parse(response);
//     console.log(body);
//     const userId = `kakao:${body.id}`;
//     if (!userId) {
//       return response.status(404)
//       .send({message: 'There was no user with the given access token.'});
//     }
//     let nickname = null;
//     let profileImage = null;
//     if (body.properties) {
//       nickname = body.properties.nickname;
//       profileImage = body.properties.profile_image;
//     }
//     return updateOrCreateUser(userId, body.kaccount_email, nickname,
//       profileImage);
//   }).then((userRecord) => {
//     const userId = userRecord.uid;
//     console.log(`creating a custom firebase token based on uid ${userId}`);
//     return firebaseAdmin.auth().createCustomToken(userId, {provider: 'KAKAO'});
//   });
// };

/**
 *  @desc Firebase Token 생성
 *  @param {String} KakaoAccessToken
 */
const createFirebaseToken = async (kakaoAccessToken) => {
  const userData = await requestMe(kakaoAccessToken);
  const body = JSON.parse(userData);
  const userId = `kakao:${body.id}`;
  if (!userId) {
    return response.status(404).send({message: 'There was no user with the given access token.'});
  }
  let nickname = null;
  let profileImage = null;
  if (body.properties) {
    nickname = body.properties.nickname;
    profileImage = body.properties.profile_image;
  }

  const userRecord = await updateOrCreateUser(userId, body.kaccount_email, nickname, profileImage);
  const userRecordId = userRecord.uid;
  console.log(`creating a custom firebase token based on uid ${userRecordId}`);
  return firebaseAdmin.auth().createCustomToken(userRecordId, {provider: 'KAKAO'});    
}

module.exports = { requestMe, updateOrCreateUser, createFirebaseToken };