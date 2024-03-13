/**
 *  @route GET /community/posts/category/:communityCategoryId/?page=
 *  @desc 커뮤니티 게시글 카테고리별 조회
 *  @access Private
 */

module.exports = async (req, res) => {
  const { page } = req.query;
};
