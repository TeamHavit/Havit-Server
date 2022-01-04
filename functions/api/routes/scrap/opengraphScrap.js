const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const ogs = require('open-graph-scraper');

module.exports = async(req, res) => {

    const {link} = req.body;
    try {
        const data = await ogs({ url : link });
        const response = {
        ogTitle: data.result.ogTitle,
        ogDescription: data.result.ogDescription,
        ogImage: data.result.ogImage,
        ogUrl: data.result.ogUrl,
        }
        console.log(data.result)
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_POST_SUCCESS, response));
    } catch(error) {
        console.log(error);
    }
  
    
}
/*
  ogs(options)
    .then((data) => {
      const { error, result, response } = data;
      console.log('error:', error);  // This returns true or false. True if there was an error. The error itself is inside the results object.
      console.log('result:', result); // This contains all of the Open Graph results
      console.log('response:', response); // This contains the HTML of page
    });
  
*/