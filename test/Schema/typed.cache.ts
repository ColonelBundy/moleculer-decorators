import "reflect-metadata";
import { Service, Action } from "../../src";
import * as web from "moleculer-web";
import Moleculer = require("moleculer");



@Service({
  mixins: [web]
})
export default class DemoController extends Moleculer.Service {
  @Action<{ params: {} }>({
    cache: {
      ttl: 1,
      enabled: true,
      lock: {
        enabled: false
      },
      meta: { a: 1 }
    }
  })
  welcome(ctx) {
    return "Hello";
  }
}
