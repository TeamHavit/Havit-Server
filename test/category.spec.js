const app = require('../functions/api/index');
const request = require('supertest');
const { expect } = require('chai');
const dotenv = require('dotenv');
dotenv.config();

describe('PATCH /category/order', () => {
    it('카테고리 순서 변경 성공', done => {
        request(app)
            .patch('/category/order')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({ 
                "categoryIndexArray": [7, 6, 10, 9, 21]
            })
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
    it('카테고리 순서 변경 - 필요한 값 없음', done => {
        request(app)
            .patch('/category/order')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "categoryIndex": []
            })
            .expect(400)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});

describe('GET /category', () => {
    it('카테고리 전체 조회 성공', done => {
        request(app)
            .get('/category')
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

describe('POST /category', () => {
    it('카테고리 생성 성공', done => {
        request(app)
            .post('/category')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "title": "취미 생활",
                "imageId": 8
            })
            .expect(201)
            .expect('Content-Type', /json/)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
    it('카테고리 생성 - 필요한 값 없음', done => {
        request(app)
            .post('/category')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "title": "취미 생활"
            })
            .expect(400)
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

describe('PATCH /category/:categoryId', () => {
    it('카테고리 수정 성공', done => {
        request(app)
            .patch('/category/9')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "title": "기획",
                "imageId": 9
            })
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
    it('카테고리 수정 - 필요한 값 없음', done => {
        request(app)
            .patch('/category/9')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "imageId": 5
            })
            .expect(400)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});

describe('DELETE /category/:categoryId', () => {
    it('카테고리 삭제 성공', done => {
        request(app)
            .delete('/category/11')
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

describe('GET /category/:categoryId?option=filter=', () => {
    it('카테고리 별 콘텐츠 성공 - option=all, filter=created_at', done => {
        request(app)
            .get('/category/9?option=all&filter=created_at')
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
    it('카테고리 별 콘텐츠 성공 - option=true, filter=seen_at', done => {
        request(app)
            .get('/category/9?option=true&filter=seen_at')
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
    it('카테고리 별 콘텐츠 성공 - option=false, filter=reverse', done => {
        request(app)
            .get('/category/9?option=false&filter=reverse')
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
    it('카테고리 별 콘텐츠 성공 - option=notified, filter=created_at', done => {
        request(app)
            .get('/category/9?option=notified&filter=created_at')
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

describe('GET /category/name', () => {
    it('카테고리 이름 조회 성공', done => {
        request(app)
            .get('/category/name')
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