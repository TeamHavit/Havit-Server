const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const { commonErrorSchema, noticeSchema } = require('../constants/swagger/schemas');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.dev' });

const options = {
    info: {
        title: 'HAVIT API Docs',
        description: 'HAVIT APP server API 문서입니다',
    },
    host: "http://localhost:5001",
    servers: [
        {
            url: 'http://localhost:5001/havit-production/asia-northeast3/api',
            description: '로컬 개발환경 host',
        },
        {
            url: process.env.DEV_HOST,
            description: '개발환경 host',
        },
    ],
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            name: 'x-auth-token',
            in: 'header',
            bearerFormat: 'JWT',
        },
    },
    components: {
        schemas: {
            ...commonErrorSchema,
            ...noticeSchema,
        }
    }
};

const outputFile = '../constants/swagger/swagger-output.json';
const endpointsFiles = ['../api/index.js'];

swaggerAutogen(outputFile, endpointsFiles, options);