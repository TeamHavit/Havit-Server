const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllRecommendations = async (client) => {
    const { rows } = await client.query(
        `
        SELECT * 
        FROM recommendation r
        `
    );
    return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getAllRecommendations };