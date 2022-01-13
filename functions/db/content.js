const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addContent = async (client, userId, title, description, image, url, isNotified) => {
    const { rows } = await client.query(
        `
        INSERT INTO content
        (user_id, title, description, image, url, is_notified)
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `, 
        [userId, title, description, image, url, isNotified]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { addContent };