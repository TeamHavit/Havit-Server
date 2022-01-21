const app = require('../functions/api/index');
const request = require('supertest');
const { expect } = require('chai');
const dotenv = require('dotenv');
dotenv.config();

describe('GET /user', () => {
    it('유저 조회 성공', done => {
        request(app)
            .get('/user')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => {
                expect(res.body.data.nickname).to.equal('jobchae');
                expect(res.body.data.totalContentNumber).to.equal(9);
                expect(res.body.data.totalCategoryNumber).to.equal(6);
                expect(res.body.data.totalSeenContentNumber).to.equal(1);
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});