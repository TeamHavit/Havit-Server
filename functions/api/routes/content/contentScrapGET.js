const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const ogs = require('open-graph-scraper');

/**
 *  @route GET /content/scrap?link=
 *  @desc 콘텐츠 스크랩
 *  @access Private
 */

module.exports = async(req, res) => {
    const { link } = req.query; // 클라이언트에게 받은 url 링크
    console.log(link);
    
    if (!link) { 
      // url 링크가 존재하지 않을 때
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    try {
        const data = await ogs({ url : link });
        let response;
        if (!data.result.ogImage) { 
          // 이미지가 존재하지 않는 경우
          response = {
            ogTitle: data.result.ogTitle,
            ogDescription: data.result.ogDescription,
            ogImage: '',
            ogUrl: data.result.ogUrl,
            }
        }
        else { 
          // 이미지가 존재하는 경우
          response = {
            ogTitle: data.result.ogTitle,
            ogDescription: data.result.ogDescription,
            ogImage: data.result.ogImage,
            ogUrl: data.result.ogUrl,
            }
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SCRAP_CONTENT_SUCCESS, response));
    } catch(error) {
        console.log(error);
    }
};