const app = require('../functions/api/index');
const request = require('supertest');
const { expect } = require('chai');
const dotenv = require('dotenv');
dotenv.config();

describe('GET /content/scrap?link=www.naver.com', () => {
    it('콘텐츠 스크랩 성공', done => {
        request(app)
            .get('/content/scrap')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .query({ link: 'www.naver.com' })
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => {
                expect(res.body.data.ogTitle).to.equal('네이버');
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
    it('필요한 값 없음', done => {
        request(app)
            .get('/content/scrap')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
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

describe('POST /content', () => {
    it('콘텐츠 생성 성공', done => {
        request(app)
            .post('/content')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({ 
                "title": "콘텐츠 생성 테스트",
                "description": "클라이언트 분들 화이팅팅",
                "image": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F9994494C5C807AE00F",
                "url": "https://coding-factory.tistory.com/329",
                "isNotified": true,
                "notificationTime": "2022-01-23 03:12",
                "categoryIds": [6, 9]
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
    it('필요한 값 없음', done => {
        request(app)
            .post('/content')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .expect(400)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
    it('존재하지 않는 카테고리', done => {
        request(app)
            .post('/content')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "title": "테스트입니다",
                "description": "서버 api 테스트",
                "image": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F9994494C5C807AE00F",
                "url": "https://coding-factory.tistory.com/329",
                "isNotified": true,
                "notificationTime": "2022-01-23 03:12",
                "categoryIds": [1, 14]
            })
            .expect(404)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});

describe('PATCH /content/check', () => {
    it('콘텐츠 조회 토글 체크 성공', done => {
        request(app)
            .patch('/content/check')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "contentId": 10
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => {
                expect(res.body.data.id).to.equal(10);
                expect(res.body.data.isSeen).to.equal(true);
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
    it('필요한 값 없음', done => {
        request(app)
            .patch('/content/check')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
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

describe('GET /content', () => {
    it('콘텐츠 전체 조회 성공 시', done => {
        request(app)
            .get('/content')
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

describe('GET /content/search?keyword=요리', () => {
    it('전체 콘텐츠 키워드 검색 성공 시', done => {
        request(app)
            .get('/content/search')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .query({ keyword: '요리' })
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
    it('필요한 값 없음', done => {
        request(app)
            .get('/content/search')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
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

describe('PATCH /content/category', () => {
    it('콘텐츠 카테고리 변경', done => {
        request(app)
            .patch('/content/category')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "contentId": 10,
                "newCategoryIds": [7, 9]
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
    it('필요한 값 없음', done => {
        request(app)
            .patch('/content/category')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .expect(400)
            .send({
                "contentId": 10,
                "newCategoryIds": []
            })
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
    it('존재하지 않는 카테고리', done => {
        request(app)
            .patch('/content/category')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "contentId": 10,
                "newCategoryIds": [7, 8]
            })
            .expect(404)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});

describe('PATCH /content/notification/:contentId', () => {
    it('콘텐츠 알림 시각 변경', done => {
        request(app)
            .patch('/content/notification/7')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "notificationTime": "2022-03-01 14:20"
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
    it('필요한 값 없음', done => {
        request(app)
            .patch('/content/notification/7')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .expect(400)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
    it('존재하지 않는 컨텐츠', done => {
        request(app)
            .patch('/content/notification/40')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({
                "notificationTime": "2022-02-03 13:20"
            })
            .expect(404)
            .then(res => {
                done();
            })
            .catch(err => {
                console.error("######Error >>", err);
                done(err);
            })
    });
});

describe('GET /content/recent', () => {
    it('최근 저장 콘텐츠 조회', done => {
        request(app)
            .get('/content/recent')
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

describe('DELETE /content/:contentId', () => {
    it('콘텐츠 삭제', done => {
        request(app)
            .delete('/content/10')
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
    it('존재하지 않는 콘텐츠', done => {
        request(app)
            .delete('/content/50')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .expect(404)
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

describe('PATCH /content/title/:contentId', () => {
    it('콘텐츠 제목 변경', done => {
        request(app)
            .patch('/content/title/7')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({ "newTitle": "알고리즘 만점 기원" })
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
    it('필요한 값 없음', done => {
        request(app)
            .patch('/content/title/7')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
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
    it('존재하지 않는 콘텐츠', done => {
        request(app)
            .patch('/content/title/15')
            .set('Content-Type', 'application/json')
            .set('x-auth-token', process.env.JWT_TOKEN)
            .send({ "newTitle": "알고리즘 만점 기원" })
            .expect(404)
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