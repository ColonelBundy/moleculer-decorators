import * as Moleculer from "moleculer";
import { CustomService } from "./CustomServiceFactory";
import { Action, Service } from "../../src";

@Service()
export default class CustomTest extends CustomService {
  @Action()
  public async testAction(_ctx: Moleculer.Context) {
    return this.foo();
  }

  private created(): void {
    this.logger.info("Successfully created!");
  }
}
