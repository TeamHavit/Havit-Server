const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllCategories = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.id, c.title, c.order_index, i.url
        FROM category c
        JOIN category_image i on c.category_image_id = i.id
        WHERE user_id = $1
        AND is_deleted = FALSE
        ORDER BY c.order_index
        `, 
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const getCategoryNames = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT c.title 
        FROM category c
        WHERE user_id = $1 
        AND is_deleted = FALSE
        ORDER BY c.order_index
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

const addCategory = async (client, userId, title, imageId, order_index) => {
    const { rows } = await client.query(
        `
        INSERT INTO category
        (user_id, title, category_image_id, order_index)
        VALUES
        ($1, $2, $3, $4)
        RETURNING *
        `,
        [userId, title, imageId, order_index],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateCategory = async (client, categoryId, title, imageId) => {
    const { rows: existingRows } = await client.query(
        `
        SELECT * FROM category c
        WHERE id = $1
        AND is_deleted = FALSE
        `,
        [categoryId],
    );

    if (existingRows.length === 0) return false;

    const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]), { title, imageId });
 
    const { rows } = await client.query(
        `
        UPDATE category c
        SET title = $1, category_image_id = $2, edited_at = now()
        WHERE id = $3
        RETURNING * 
        `,
        [data.title, data.imageId, categoryId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteCategory = async (client, categoryId) => {
    const { rows } = await client.query(
        `
        UPDATE category
        SET is_deleted = true, edited_at = now()
        WHERE id = $1
        `,
        [categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getCategory = async (client, categoryId) => {
    const { rows } = await client.query(
        `
        SELECT * FROM category
        WHERE id = $1
        `,
        [categoryId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { getAllCategories, addCategory, getCategoryNames, updateCategory, deleteCategory, getCategory };