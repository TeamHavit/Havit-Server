const express = require('express');
const router = express.Router();

router.get(
    '/', require('./noticeGET')
    /**
     * #swagger.summary = "공지사항 전체 조회"
     * #swagger.responses[200] = {
           description: "공지사항 조회 성공",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/responseNoticeSchema"
                   }
               }           
           }
       }   
   */
);

module.exports = router;