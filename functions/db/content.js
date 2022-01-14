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
};

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
            SET is_seen = true, seen_at = now()
            WHERE id = $1
            RETURNING id, is_seen
            `,
            [contentId]
        );
        return convertSnakeToCamel.keysToCamel(rows[0]);
    }
    else {
        const { rows } = await client.query(
            `
            UPDATE content
            SET is_seen = false, seen_at = null
            WHERE id = $1
            RETURNING id, is_seen
            `,
            [contentId]
        );
        return convertSnakeToCamel.keysToCamel(rows[0]);
    }
};

const getAllContents = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.description, c.image, c.url, c.is_seen, c.is_notified, c.created_at, n.notification_time
        FROM content c
        JOIN notification n on c.id = n.content_id
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.is_notified = true
        UNION ALL
        SELECT c.id, c.title, c.description, c.image, c.url, c.is_seen, c.is_notified, c.created_at, null as notification_time
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.is_notified = false
        ORDER BY created_at
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { addContent, toggleContent, getAllContents };