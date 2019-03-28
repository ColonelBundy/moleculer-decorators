import * as Moleculer from 'moleculer';
import { CustomService } from './CustomServiceFactory';
import { Action, Service } from '../../src';
import 'reflect-metadata';


@Service()
class CustomTest extends CustomService {
  @Action()
  public async testAction(_ctx: Moleculer.Context) {
    return this.foo()
  }

  private created(): void {
    this.logger.info('Successfully created!');
  }
}

module.exports = CustomTest;
