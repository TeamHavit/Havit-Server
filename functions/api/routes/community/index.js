const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/category', require('./communityCategoryGET')
    /**
     * #swagger.summary = "커뮤니티 카테고리 전체 조회"
     * #swagger.responses[200] = {
           description: "커뮤니티 카테고리 조회 성공",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/responseCommunityCategorySchema"
                   }
               }           
           }
       }   
   */
);

router.get('/posts/:communityPostId', checkUser, require('./communityPostGET')
    /**
     * #swagger.summary = "커뮤니티 게시글 상세 조회"
     * #swagger.responses[200] = {
            description: "커뮤니티 게시글 상세 조회 성공",
            content: {
                "application/json": {
                    schema:{
                        $ref: "#/components/schemas/responseCommunityPostsDetailSchema"
                    }
                }           
            }
        }   
     * #swagger.responses[400]
     * #swagger.responses[404] 
    */
);

module.exports = router;