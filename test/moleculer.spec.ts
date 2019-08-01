import { ServiceBroker } from 'moleculer';
import { CustomService } from './customServices/CustomServiceFactory';
import api from './services/api.service';
import get from './services/get.service';
import db from './services/db.service';
import custom from './customServices/custom.service';
import * as request from 'supertest';

describe('Moleculer', () => {
  const broker = new ServiceBroker({ logLevel: 'warn' });
  const customizedBroker = new ServiceBroker({
    // @ts-ignore
    ServiceFactory: CustomService,
    logLevel: 'warn'
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
    broker.createService(get);
    const apiService = broker.createService(api);

    it('should pass auth', async () => {
      await request(apiService.server)
        .get('/getTest/getModel/5')
        .set('Authorization', VALID_TOKEN)
        .expect(200);

      // close HTTP service to release the port
      broker.destroyService(apiService);
    });
  });

  describe('moleculer-db mixin', () => {
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
    const customService = customizedBroker.createService(custom);

    it('should load the service inherited from CustomService factory', () => {
      expect(customService).toBeDefined();
    });

    it('should return "bar" value', async () => {
      expect(await customizedBroker.call('CustomTest.testAction')).toEqual(
        'bar'
      );
    });
  });
});
