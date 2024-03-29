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

const getContentsByFilter = async (client, userId, filter) => {
    if (filter === "reverse") {
        // API 로직에서 reverse 할 것이므로 created_at 기준으로 정렬한다.
        filter = "created_at"; 
    }
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.image, c.description, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at, c.seen_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE
        ORDER BY ${filter} DESC
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getContentsByFilterAndNotified = async (client, userId, option, filter) => {
    if (filter === "reverse") {
        // API 로직에서 reverse 할 것이므로 created_at 기준으로 정렬한다.
        filter = "created_at";
    }
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.image, c.description, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at, c.seen_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.is_notified = ${option} AND c.notification_time > NOW()
        ORDER BY ${filter} DESC
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getContentsByFilterAndSeen = async (client, userId, option, filter) => {
    if (filter === "reverse") {
        // API 로직에서 reverse 할 것이므로 createdAt 기준으로 정렬한다.
        filter = "created_at";
    }
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.image, c.description, c.url, c.is_seen, c.is_notified, c.notification_time, c.created_at, c.seen_at
        FROM content c
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.is_seen = ${option}
        ORDER BY ${filter} DESC
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
        WHERE c.user_id = $1 AND c.is_deleted = FALSE AND c.title ilike $2
        ORDER BY created_at DESC
        `,
        [userId, searchKeyword]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const updateContentIsDeleted = async (client, categoryId, userId) => {
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
        WHERE count_content.category_count <= 1 AND content.id = count_content.content_id AND user_id = $2
        `,
        [categoryId, userId]
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

const deleteContent = async (client, contentId, userId) => {
    const { rows } = await client.query(
        `
        UPDATE content
        SET is_deleted = TRUE, is_notified = FALSE, notification_time = null
        WHERE id = $1 AND user_id = $2
        RETURNING *
        `,
        [contentId, userId]
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

const updateContentNotification = async (client, contentId, notificationTime, isNotified) => {
    const { rows } = await client.query(
        `
        UPDATE content
        SET notification_time = $2, edited_at = now(), is_notified = $3
        WHERE id = $1 AND is_deleted = FALSE
        RETURNING *
        `,
        [contentId, notificationTime, isNotified]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getContent = async (client, userId, title, url) => {
    const { rows } = await client.query(
        `
        SELECT user_id, title, url FROM content
        WHERE user_id = $1 AND title = $2 AND url = $3
        `,
        [userId, title, url]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

const getScheduledContentNotification = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT id, title, notification_time, url, image, description, created_at, is_seen FROM content 
        WHERE user_id = $1 AND is_deleted = FALSE AND is_notified = TRUE AND notification_time > NOW()
        ORDER BY created_at DESC
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getExpiredContentNotification = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT id, title, notification_time, url, image, description, created_at, is_seen FROM content 
        WHERE user_id = $1 AND is_deleted = FALSE AND is_notified = TRUE AND notification_time <= NOW()
        ORDER BY created_at DESC
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getContentById = async (client, contentId) => {
    const { rows } = await client.query(
        `
        SELECT *
        FROM content
        WHERE id = $1 AND is_deleted = FALSE
        `,
        [contentId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { addContent, toggleContent, getContentsByFilter, getContentsByFilterAndNotified, getContentsByFilterAndSeen, searchContent, updateContentIsDeleted, 
    getRecentContents, getUnseenContents, deleteContent, renameContent, updateContentNotification, getContent, getScheduledContentNotification, getExpiredContentNotification, getContentById };