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

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getCommunityPosts = async (client, userId, limit, page) => {
  const { rows } = await client.query(
    `
    SELECT cp.id, u.nickname, cp.title, cp.body, cp.content_url, cp.content_title, cp.content_description, cp.thumbnail_url, cp.created_at
    FROM community_post cp
    JOIN "user" u ON cp.user_id = u.id
    LEFT JOIN community_post_report_user cpru ON cp.id = cpru.community_post_id AND cpru.report_user_id = $1
    WHERE cp.is_deleted = FALSE AND cpru.id IS NULL
    ORDER BY cp.created_at DESC, cp.id DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, (page - 1) * limit],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getCommunityCategories = async (client) => {
  const { rows } = await client.query(
    `
    SELECT cc.id, cc.name
    FROM community_category cc
    WHERE cc.is_deleted = FALSE
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getCommunityPostsCount = async (client) => {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int 
    FROM community_post
    WHERE is_deleted = FALSE
    `,
  );

  return rows[0].count;
};

module.exports = {
  getCommunityPostDetail,
  getCommunityPosts,
  getCommunityPostsCount,
  getCommunityCategories,
};
