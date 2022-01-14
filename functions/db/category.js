const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

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

const addCategory = async (client, userId, title, imageId, content_number, order_index) => {
    const currentTime = dayjs().tz("Asia/Seoul").format();
    const { rows } = await client.query(
        `
        INSERT INTO category
        (user_id, title, category_image_id, content_number, order_index, created_at, edited_at)
        VALUES
        ($1, $2, $3, $4, $5, $6, $6)
        RETURNING *
        `,
        [userId, title, imageId, content_number, order_index, currentTime],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateCategory = async (client, categoryId, title, imageId) => {
    const currentTime = dayjs().tz("Asia/Seoul").format();
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
    SET title = $1, category_image_id = $2, edited_at = $4
    WHERE id = $3
    RETURNING * 
    `,
    [data.title, data.imageId, categoryId, currentTime],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getAllCategories, addCategory, getCategoryNames, updateCategory };