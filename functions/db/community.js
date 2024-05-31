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

const getCommunityPosts = async (client, userId, limit, offset) => {
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
    [userId, limit, offset],
  );
  return convertSnakeToCamel.keysToCamel(rows);
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

const isExistingCategory = async (client, communityCategoryId) => {
  const { rows } = await client.query(
    `
    SELECT 1
    FROM community_category
    WHERE id = $1 AND is_deleted = FALSE
    `,
    [communityCategoryId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
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

const getCommunityPostsCount = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int
    FROM community_post cp
    LEFT JOIN community_post_report_user cpru ON cp.id = cpru.community_post_id AND cpru.report_user_id = $1
    WHERE cp.is_deleted = FALSE AND cpru.id IS NULL
    `,
    [userId],
  );

  return rows[0].count;
};

const getReportedPostByUser = async (client, userId, communityPostId) => {
  const { rows } = await client.query(
    `
    SELECT 1 
    FROM community_post_report_user cpru
    WHERE cpru.report_user_id = $1 AND cpru.community_post_id = $2
    `,
    [userId, communityPostId],
  );

  return rows[0];
};

const getCommunityCategoryPostsCount = async (client, userId, communityCategoryId) => {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int
    FROM community_post cp
    JOIN community_category_post ccp ON cp.id = ccp.community_post_id
    LEFT JOIN community_post_report_user cpru ON cp.id = cpru.community_post_id AND cpru.report_user_id = $1
    WHERE cp.is_deleted = FALSE AND ccp.community_category_id = $2 AND cpru.id IS NULL
    `,
    [userId, communityCategoryId],
  );

  return rows[0].count;
};

const getCommunityCategoryPostsById = async (
  client,
  userId,
  communityCategoryId,
  limit,
  offset,
) => {
  const { rows } = await client.query(
    `
    SELECT cp.id, u.nickname, cp.title, cp.body, cp.content_url, cp.content_title, cp.content_description, cp.thumbnail_url, cp.created_at
    FROM community_post cp
    JOIN "user" u ON cp.user_id = u.id
    JOIN community_category_post ccp ON cp.id = ccp.community_post_id
    LEFT JOIN community_post_report_user cpru ON cp.id = cpru.community_post_id AND cpru.report_user_id = $1
    WHERE cp.is_deleted = FALSE AND ccp.community_category_id = $2 AND cpru.id IS NULL
    ORDER BY cp.created_at DESC, cp.id DESC
    LIMIT $3 OFFSET $4
    `,
    [userId, communityCategoryId, limit, offset],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const reportCommunityPost = async (client, userId, communityPostId) => {
  const { rows: existingCommunityPosts } = await client.query(
    `
    UPDATE community_post
    SET reported_count = reported_count + 1
    WHERE id = $1
    RETURNING *
    `,
    [communityPostId],
  );
  if (!existingCommunityPosts[0]) return existingCommunityPosts[0];
  const { rows: communityPostReports } = await client.query(
    `
    INSERT INTO community_post_report_user
      (report_user_id, community_post_id)
    VALUES
      ($1, $2)
    RETURNING *
    `,
    [userId, communityPostId],
  );
  return convertSnakeToCamel.keysToCamel(communityPostReports[0]);
};

const getCommunityPostById = async (client, communityPostId) => {
  const { rows } = await client.query(
    `SELECT *
    FROM community_post
    WHERE id = $1 AND is_deleted = FALSE
    `,
    [communityPostId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteCommunityPost = async (client, communityPostId) => {
  const { rows } = await client.query(
    `
    UPDATE community_post
    SET is_deleted = TRUE
    WHERE id = $1
    `,
    [communityPostId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getCommunityPostDetail,
  getCommunityPosts,
  addCommunityPost,
  addCommunityCategoryPost,
  verifyExistCategories,
  isExistingCategory,
  getCommunityCategories,
  getCommunityPostsCount,
  getReportedPostByUser,
  getCommunityCategoryPostsCount,
  getCommunityCategoryPostsById,
  reportCommunityPost,
  getCommunityPostById,
  deleteCommunityPost,
};
