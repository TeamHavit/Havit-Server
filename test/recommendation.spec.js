const app = require('../functions/api/index');
const request = require('supertest');
const { expect } = require('chai');
const dotenv = require('dotenv');
dotenv.config();

describe('GET /recommendation', () => {
    it('카테고리 이미지 전체 조회 성공', done => {
        request(app)
            .get('/recommendation')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});