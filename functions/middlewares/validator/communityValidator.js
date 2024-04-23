const { body, query, param } = require('express-validator');

const createCommunityPostValidator = [
  body('communityCategoryIds')
    .isArray()
    .notEmpty()
    .withMessage('Invalid communityCategoryIds field'),
  body('title').isString().notEmpty().withMessage('Invalid title field'),
  body('body').isString().notEmpty().withMessage('Invalid body field'),
  body('contentUrl').isString().notEmpty().withMessage('Invalid contentUrl field'),
  body('contentTitle').isString().notEmpty().withMessage('Invalid contentTitle field'),
];

const getCommunityPostsValidator = [
  query('page').notEmpty().isInt({ min: 1 }).withMessage('Invalid page field'),
  query('limit').notEmpty().isInt({ min: 1 }).withMessage('Invalid limit field'),
];

const getCommunityPostValidator = [
  param('communityPostId')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Invalid communityPostId field'),
];

const getCommunityCategoryPostsValidator = [
  query('page').notEmpty().isInt({ min: 1 }).withMessage('Invalid page field'),
  query('limit').notEmpty().isInt({ min: 1 }).withMessage('Invalid limit field'),
  param('communityCategoryId')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Invalid communityCategoryId field'),
];

const reportCommunityPostValidator = [
  body('communityPostId').isInt({ min: 1 }).notEmpty().withMessage('Invalid communityPostId')
]

module.exports = {
  createCommunityPostValidator,
  getCommunityPostsValidator,
  getCommunityPostValidator,
  getCommunityCategoryPostsValidator,
  reportCommunityPostValidator
};
