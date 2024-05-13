import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);
const expect = chai.expect;

describe('AppController Endpoints', () => {
    it('GET /status responds with status 200 and JSON object with redis and db properties', async () => {
        const response = await request(app).get('/status');
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('redis');
        expect(response.body).to.have.property('db');
    });
});
