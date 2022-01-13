const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addNotification = async (client, userId, contentId, notificationTime) => {
    const { rows } = await client.query(
        `
        INSERT INTO notification
        (user_id, content_id, notification_time)
        VALUES
        ($1, $2, $3)
        RETURNING *
        `, 
        [userId, contentId, notificationTime]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { addNotification };