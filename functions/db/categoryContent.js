const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllCategoryContentByFilter = async (client, userId, categoryId, filter) => {
    if (filter == "reverse") {
        // API 로직에서 reverse 할 것이므로 created_at 기준으로 정렬한다.
        filter = "created_at"; 
    }
    const { rows } = await client.query(
        `
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified, c2.notification_time, c2.created_at, c2.seen_at
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_deleted = FALSE
        ORDER BY ${filter} DESC
        `,
        [userId, categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getCategoryContentByFilterAndNotified = async (client, userId, categoryId, option, filter) => {
    if (filter == "reverse") {
        // API 로직에서 reverse 할 것이므로 createdAt 기준으로 정렬한다.
        filter = "created_at";
    }
    const { rows } = await client.query(
        `
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified, c2.notification_time, c2.created_at, c2.seen_at
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id 
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_deleted = FALSE AND c2.is_notified = ${option} AND c2.notification_time > NOW()
        ORDER BY ${filter} DESC
        `,
        [userId, categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getCategoryContentByFilterAndSeen = async (client, userId, categoryId, option, filter) => {
    if (filter == "reverse") {
        // API 로직에서 reverse 할 것이므로 createdAt 기준으로 정렬한다.
        filter = "created_at";
    }
    const { rows } = await client.query(
        `
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified, c2.notification_time, c2.created_at, c2.seen_at
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_deleted = FALSE AND c2.is_seen = ${option}
        ORDER BY ${filter} DESC
        `,
        [userId, categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getCategoryContentByContentId = async (client, contentId, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.order_index, i.id as image_id, i.url as image_url
        FROM category_content cc
        JOIN category c on c.id = cc.category_id
        JOIN category_image i on c.category_image_id = i.id
        WHERE cc.content_id = $1 AND c.user_id = $2
        ORDER BY c.order_index
        `,
        [contentId, userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
}

const addCategoryContent = async (client, categoryId, contentId) => {
    const { rows } = await client.query(
        `
        INSERT INTO category_content
        (category_id, content_id)
        VALUES
        ($1, $2)
        `,
        [categoryId, contentId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteCategoryContentByCategoryId = async (client, categoryId) => {
    const { rows } = await client.query(
        `
        DELETE
        FROM category_content
        WHERE category_id = $1
        `,
        [categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const deleteCategoryContentByContentId = async (client, contentId) => {
    const { rows } = await client.query(
        `
        DELETE
        FROM category_content
        WHERE content_id = $1
        RETURNING *
        `,
        [contentId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const searchCategoryContent = async (client, userId, categoryId, keyword) => {
    const searchKeyword = '%' + keyword + '%';
    const { rows } = await client.query(
        `
        SELECT co.id, co.title, co.image, co.description, co.url, co.is_seen, co.is_notified, co.notification_time, co.created_at, co.seen_at
        FROM content co
        JOIN category_content cc on co.id = cc.content_id
        JOIN category ca on ca.id = cc.category_id
        WHERE ca.id = $2 AND co.user_id = $1 AND co.is_deleted = FALSE AND co.title ilike $3
        ORDER BY co.created_at DESC
        `,
        [userId, categoryId, searchKeyword]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getAllCategoryContentByFilter, getCategoryContentByFilterAndNotified, getCategoryContentByFilterAndSeen, getCategoryContentByContentId, addCategoryContent, 
    deleteCategoryContentByCategoryId, deleteCategoryContentByContentId, searchCategoryContent };