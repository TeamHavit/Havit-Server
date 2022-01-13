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

const toggleContent = async (client, contentId) => {
    const { rows } = await client.query(
        `
        SELECT is_seen FROM content
        where id = $1
        `,
        [contentId]
    );
    if (rows[0].is_seen === false) {
        const { rows } = await client.query(
            `
            UPDATE content
            SET is_seen = true
            WHERE id = $1
            RETURNING id, is_seen
            `,
            [contentId]
        )
        return convertSnakeToCamel.keysToCamel(rows[0]);
    }
    else {
        const { rows } = await client.query(
            `
            UPDATE content
            SET is_seen = false
            WHERE id = $1
            RETURNING id, is_seen
            `,
            [contentId]
        )
        return convertSnakeToCamel.keysToCamel(rows[0]);
    }
}

module.exports = { addContent, toggleContent };