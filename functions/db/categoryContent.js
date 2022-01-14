const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllCategoryContentByFilter = async (client, userId, categoryId, filter) => {
    if (filter == "reverse") {
        // 최근 저장 순 컨트롤러에서 반대로 reverse 할 것이므로 createdAt 기준으로 정렬한다.
        filter = "created_at"; 
    }
    const { rows } = await client.query(
        `
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified, c2.created_at, c2.seen_at, n.notification_time
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id
        JOIN notification n on c2.id = n.content_id
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_notified = TRUE AND c2.is_deleted = FALSE
        UNION ALL
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified,  c2.created_at, c2.seen_at, null as notification_time
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_notified = FALSE AND c2.is_deleted = FALSE
        ORDER BY ${filter}
        `,
        [userId, categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getCategoryContentByFilterAndSeen = async (client, userId, categoryId, seen, filter) => {
    if (filter == "reverse") {
        // 최근 저장 순 컨트롤러에서 반대로 reverse 할 것이므로 createdAt 기준으로 정렬한다.
        filter = "created_at";
    }
    const { rows } = await client.query(
        `
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified, c2.created_at, c2.seen_at, n.notification_time
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id
        JOIN notification n on c2.id = n.content_id
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_notified = TRUE AND c2.is_deleted = FALSE AND c2.is_seen = ${seen}
        UNION ALL
        SELECT c2.id, c2.title, c2.image, c2.description, c2.url, c2.is_seen, c2.is_notified,  c2.created_at, c2.seen_at, null as notification_time
        FROM category c
        JOIN category_content cc on c.id = cc.category_id
        JOIN content c2 on cc.content_id = c2.id
        WHERE c.id = $2 AND c2.user_id = $1 AND c2.is_notified = FALSE AND c2.is_deleted = FALSE AND c2.is_seen = ${seen}
        ORDER BY ${filter}
        `,
        [userId, categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getAllCategoryContentByFilter, getCategoryContentByFilterAndSeen };