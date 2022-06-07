const { default: axios } = require('axios');

const createPushServerUser = async (fcmToken) => {
    const baseURL = process.env.PUSH_SERVER_URL;
    const url = `${baseURL}user`;

    const response = await axios.post(url, { fcmToken });


    console.log(response.data);
    return response.data.data._id;
}

module.exports = { createPushServerUser }