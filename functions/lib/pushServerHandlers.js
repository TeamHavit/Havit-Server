const { default: axios } = require('axios');

const baseURL = process.env.PUSH_SERVER_URL;

const createPushServerUser = async (fcmToken) => {
    const url = `${baseURL}user`;

    const response = await axios.post(url, { fcmToken });

    return response.data.data._id;
}

const createNotification = async (data) => {
    const url = `${baseURL}reminder`;

    const response = await axios.post(url, data);

    return response.data;
}

const modifyNotificationTime = async (contentId, time) => {
    const url = `${baseURL}reminder`;

    const response = await axios.patch(url, {
        contentId,
        time
    });

    return response.data;
}

const modifyFcmToken = async (mongoUserId, fcmToken) => {
    const url = `${baseURL}user/${mongoUserId}/refresh-token`;

    const response = await axios.put(url, {
        fcmToken
    });

    return response;
}

const deleteNotification = async (contentId) => {
    const url = `${baseURL}reminder/${contentId}`;

    const response = await axios.delete(url);

    return response
}

const modifyContentTitle = async (contentId, ogTitle) => {
    const url = `${baseURL}reminder/title`;

    const response = await axios.patch(url, {
        contentId,
        ogTitle
    });

    return response;
}

const deletePushUser = async (mongoUserId) => {
    const url = `${baseURL}user/${mongoUserId}`;

    const response = await axios.delete(url);

    return response;
} 

module.exports = { createPushServerUser, createNotification, modifyNotificationTime, modifyFcmToken, deleteNotification, modifyContentTitle, deletePushUser }