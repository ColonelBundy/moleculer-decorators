import { Service } from '../../src';
import * as moleculer from 'moleculer';
import * as DbMixin from 'moleculer-db';

@Service({
  mixins: [DbMixin]
})
export default class DbService extends moleculer.Service {
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
