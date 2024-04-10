const { body, query } = require('express-validator');

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

module.exports = {
  createCommunityPostValidator,
  getCommunityPostsValidator,
};
