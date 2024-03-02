const express = require('express');
const router = express.Router();

router.use(
    '/content', require('./content') 
    /** 
     * #swagger.tags = ['content'] 
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */ 
);
router.use(
    '/category', require('./category')
    /** 
     * #swagger.tags = ['category'] 
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */
);
router.use(
    '/recommendation', require('./recommendation')
    /** 
     * #swagger.tags = ['recommendation']
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */
);
router.use(
    '/user', require('./user')
    /** 
     * #swagger.tags = ['user'] 
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */
);
router.use(
    '/auth', require('./auth')
    /** 
     * #swagger.tags = ['auth'] 
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */
);
router.use(
    '/notice', require('./notice')
    /** 
     * #swagger.tags = ['notice'] 
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */
    
);
router.use(
    '/health', require('./health')
    /** 
     * #swagger.tags = ['health'] 
     * #swagger.responses[500] = {
           description: "Internal Server Error",
           content: {
               "application/json": {
                   schema:{
                       $ref: "#/components/schemas/internalServerErrorSchema"
                   }
               }           
           }
       }   
   */
);

module.exports = router;