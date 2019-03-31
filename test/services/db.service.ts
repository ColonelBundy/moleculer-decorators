import { Service } from '../../src';
const moleculer = require('moleculer');
const DbMixin = require('moleculer-db');

@Service({
  mixins: [DbMixin]
})
class DbService extends moleculer.Service {
  public connected: boolean = false;

  public afterConnected() {
    this.connected = true;
  }

  entityCreated(data) {
    this.logger.info(data);
  }

  entityUpdated(data) {
    this.logger.info(data);
  }

  public entityRemoved(data) {
    this.logger.info(data);
  }
}

module.exports = DbService;
