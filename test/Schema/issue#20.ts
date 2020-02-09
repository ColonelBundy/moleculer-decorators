import "reflect-metadata";
import { Service, Action } from "../../src";
import * as web from "moleculer-web";
import Moleculer = require("moleculer");

@Service({
  mixins: [web]
})
export default class DemoController extends Moleculer.Service {
  @Action({
    rest: "GET /welcome"
  })
  welcome(ctx) {
    return "Hello";
  }
}
