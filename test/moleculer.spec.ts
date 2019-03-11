import { ServiceBroker } from 'moleculer';
import * as request from 'supertest';

describe('Moleculer', () => {
  const broker = new ServiceBroker();

  beforeAll(() => {
    return broker.start();
  });

  afterAll(() => {
    return broker.stop();
  });

  describe('Test auth', () => {
    const VALID_TOKEN = '123';
    const api = require('./services/api.service');
    const get = require('./services/get.service');
    broker.createService(get);
    const apiService = broker.createService(api);

    it('should pass auth', async () => {
      return request(apiService.server).get('/getTest/getModel/5')
        .set('Authorization', VALID_TOKEN)
        .expect(200);
    });
  });

  // when running via moleculer-runner, broker creates services with loadService
  describe('Load services', () => {

    it('should load the services', () => {
      expect(broker.loadService('test/services/get.service.ts'))
        .toBeDefined();
    });

    it('should load the service dir', () => {
      expect(broker.loadServices('test/services', '*.service.ts'))
        .toEqual(2);
    })
  });
});
