const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getCommunityPostDetail = async (client, communityPostId) => {
  const { rows } = await client.query(
    `
    SELECT cp.id, u.nickname, cp.title, cp.body, cp.content_url, cp.content_title, cp.content_description, cp.thumbnail_url, cp.created_at
    FROM community_post cp
    JOIN "user" u on cp.user_id = u.id
    WHERE cp.id = $1 AND cp.is_deleted = FALSE
    `,
    [communityPostId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getCommunityPostDetail };
