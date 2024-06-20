const functions = require('firebase-functions');
const axios = require('axios');

// 슬랙 Webhook에서 발급받은 endpoint를 .env 파일에서 끌어옴
// endpoint 자체는 깃허브에 올라가면 안 되기 때문!
const WEB_HOOK_ERROR_MONITORING = process.env.WEB_HOOK_ERROR_MONITORING;

const sendMessageToSlack = (
  message,
  apiEndPoint = WEB_HOOK_ERROR_MONITORING,
  isBlockMessage = false,
) => {
  // 슬랙 Webhook을 이용해 슬랙에 메시지를 보내는 코드
  const body = isBlockMessage ? message : { text: message };

  try {
    axios
      .post(apiEndPoint, body)
      .then((response) => {})
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    console.error(e);
    // 슬랙 Webhook 자체에서 에러가 났을 경우,
    // Firebase 콘솔에 에러를 찍는 코드
    functions.logger.error('[slackAPI 에러]', { error: e });
  }
};

// 이 파일에서 정의한 변수 / 함수를 export 해서, 다른 곳에서 사용할 수 있게 해주는 코드
module.exports = {
  sendMessageToSlack,
  WEB_HOOK_ERROR_MONITORING,
};
