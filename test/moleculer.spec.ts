import { ServiceBroker } from 'moleculer';
import { CustomService } from './customServices/CustomServiceFactory';
import * as request from 'supertest';

describe('Moleculer', () => {
  const broker = new ServiceBroker();
  const customizedBroker = new ServiceBroker({
    ServiceFactory: CustomService
  });

  beforeAll(async () => {
    await broker.start();
    await customizedBroker.start();
  });

  afterAll(async () => {
    await broker.stop();
    await customizedBroker.stop();
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
        .toEqual(3);
    })
  });

  describe('moleculer-db mixin', () => {
    const db = require('./services/db.service');
    const dbService = broker.createService(db);

    it('should have all lifecycle methods available', () => {
      expect(dbService.schema.afterConnected).toBeDefined();
      expect(dbService.schema.entityCreated).toBeDefined();
      expect(dbService.schema.entityUpdated).toBeDefined();
      expect(dbService.schema.entityRemoved).toBeDefined();
    });

    it('should change a value of "connected" prop after start', () => {
      expect(dbService.connected).toEqual(true);
    });
  });

  // when running via moleculer-runner, broker creates services with loadService
  describe('Test broker ServiceFactory', () => {
    const custom = require('./customServices/custom.service');
    const customService = customizedBroker.createService(custom);

    it('should load the service inherited from CustomService factory', () => {
      expect(customService).toBeDefined();
    });
    it('should return "bar" value', async () => {
      expect(await customizedBroker.call('CustomTest.testAction'))
        .toEqual('bar');
    });
  });
});
