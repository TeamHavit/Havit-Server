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

const addCommunityPost = async (
  client,
  userId,
  title,
  body,
  contentUrl,
  contentTitle,
  contentDescription,
  thumbnailUrl,
) => {
  const { rows } = await client.query(
    `
    INSERT INTO community_post
    (user_id, title, body, content_url, content_title, content_description, thumbnail_url)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [userId, title, body, contentUrl, contentTitle, contentDescription, thumbnailUrl],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addCommunityCategoryPost = async (client, communityCategoryId, communityPostId) => {
  const { rows } = await client.query(
    `
    INSERT INTO community_category_post
    (community_category_id, community_post_id)
    VALUES
    ($1, $2)
    `,
    [communityCategoryId, communityPostId],
  );
};

const verifyExistCategories = async (client, communityCategoryIds) => {
  const { rows } = await client.query(
    `
      SELECT element
      FROM unnest($1::int[]) AS element
      LEFT JOIN community_category ON community_category.id = element
      WHERE community_category.id IS NULL;
    `,
    [communityCategoryIds],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getCommunityPostDetail,
  addCommunityPost,
  addCommunityCategoryPost,
  verifyExistCategories,
};
