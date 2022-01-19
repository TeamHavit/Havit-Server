const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addContent = async (client, userId, title, description, image, url, isNotified, notificationTime) => {
    const { rows } = await client.query(
        `
        INSERT INTO content
        (user_id, title, description, image, url, is_notified, notification_time)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `, 
        [userId, title, description, image, url, isNotified, notificationTime]
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
    if (rows[0] === undefined) {
        // 특정 콘텐츠 id를 가진 콘텐츠가 존재하지 않을 때
        return convertSnakeToCamel.keysToCamel(rows[0]);
    }
    if (rows[0].is_seen === false) {
        // 특정 콘텐츠 id를 가진 콘텐츠가 존재할 때
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
        SELECT c.id, c.title, c.description, c.image, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE
        ORDER BY created_at
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const searchContent = async (client, userId, keyword) => {
    const searchKeyword = '%' + keyword + '%';
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.description, c.image, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.title like $2
        ORDER BY created_at DESC
        `,
        [userId, searchKeyword]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const updateContentIsDeleted = async (client, categoryId) => {
    const { rows } = await client.query(
        `
        UPDATE content
        SET is_deleted = true, edited_at = now()
        FROM ( 
            SELECT ca_content.content_id , COUNT(*) AS category_count
            FROM (
                SELECT category_id, cc.content_id
                FROM category_content cc, (
                    SELECT cc.content_id
                    FROM category_content cc
                    WHERE cc.category_id = $1
                ) AS sub_content_id
                WHERE cc.content_id = sub_content_id.content_id ) AS ca_content
            GROUP BY ca_content.content_id
            HAVING COUNT(ca_content.content_id) > 0 ) AS count_content
        WHERE count_content.category_count <= 1 AND content.id = count_content.content_id
        `,
        [categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRecentContents = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.description, c.image, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT 20
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getUnseenContents = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.description, c.image, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.is_seen = FALSE
        ORDER BY created_at DESC
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const deleteContent = async (client, contentId) => {
    const { rows } = await client.query(
        `
        UPDATE content
        SET is_deleted = TRUE, is_notified = FALSE, notification_time = null
        WHERE id = $1
        RETURNING *
        `,
        [contentId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const renameContent = async (client, contentId, newTitle) => {
    const { rows } = await client.query(
        `
        UPDATE content
        SET title = $2, edited_at = now()
        WHERE id = $1 AND is_deleted = FALSE
        RETURNING *
        `,
        [contentId, newTitle]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateContentNotification = async (client, contentId, notificationTime) => {
    const { rows } = await client.query(
        `
        UPDATE content
        SET notification_time = $2, edited_at = now()
        WHERE id = $1 AND is_deleted = FALSE AND is_notified = TRUE
        RETURNING *
        `,
        [contentId, notificationTime]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { addContent, toggleContent, getAllContents, searchContent, updateContentIsDeleted, getRecentContents, getUnseenContents, deleteContent,
     renameContent, updateContentNotification };