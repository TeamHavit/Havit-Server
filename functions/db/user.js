const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUser = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT * FROM "user"
        WHERE id = $1
        `,
        [userId]
    );
    console.log(rows);
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getUser };