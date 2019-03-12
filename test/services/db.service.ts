import { BaseSchema, Service } from '../../src';
const DbMixin = require('moleculer-db');

@Service({
  mixins: [DbMixin]
})
class DbService extends BaseSchema {
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
