const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getNotices = async (client) => {
  const { rows } = await client.query(
    `
    SELECT title, url, created_at FROM "notice"
    WHERE is_deleted = FALSE
    ORDER BY created_at DESC
    `
  ) 
  return convertSnakeToCamel.keysToCamel(rows);
}

module.exports = { getNotices }