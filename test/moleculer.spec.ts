import {ServiceBroker} from 'moleculer';
import * as request from 'supertest';

describe('Moleculer', () => {
  describe('Test auth', () => {
    const VALID_TOKEN = '123';
    const broker = new ServiceBroker();
    const api = require('./services/api.service');
    const get = require('./services/get.service');
    broker.createService(get);
    const apiService = broker.createService(api);

    beforeAll(() => {
      return broker.start();
    });

    afterAll(() => {
      return broker.stop();
    });

    it('should pass auth', async () => {
      return request(apiService.server).get('/getTest/getModel/5')
        .set('Authorization', VALID_TOKEN)
        .expect(200);
    });
  });
});
