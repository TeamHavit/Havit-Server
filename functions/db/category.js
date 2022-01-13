const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllCategories = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.content_number, c.order_index, i.url
        FROM category c
        JOIN category_image i on  c.category_image_id = i.id
        WHERE user_id = $1
        AND is_deleted = FALSE
        ORDER BY c.order_index
        `, 
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const addCategory = async (client, userId, title, imageId, content_number, order_index) => {
    const { rows } = await client.query(
        `
        INSERT INTO category
        (user_id, title, category_image_id, content_number, order_index)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [userId, title, imageId, content_number, order_index],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getAllCategories, addCategory };