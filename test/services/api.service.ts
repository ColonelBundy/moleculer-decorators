import { IncomingMessage, ServerResponse } from "http";
import * as Moleculer from "moleculer";
import { Method, Service } from "../../src";
import * as ApiGateway from "moleculer-web";

export interface User {
  id: string;
}

const { Errors } = ApiGateway;

@Service({
  mixins: [ApiGateway],
  settings: {
    port: process.env.PORT || 9000,
    routes: [
      {
        aliases: {
          "GET getTest/getModel/:withUser": "GetTest.getModel"
        },
        authentication: true,
        whitelist: ["**"]
      }
    ]
  }
})
export default class Api extends Moleculer.Service {
  @Method
  public async authenticate(
    ctx: Moleculer.Context,
    route: string,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const accessToken = req.headers.authorization;
    if (accessToken) {
      const user = await this._getUserFromRemoterService(ctx, accessToken);
      if (user) {
        return Promise.resolve({ ...user.user, id: user.user.externalId });
      } else {
        return Promise.reject(
          new Errors.UnAuthorizedError(Errors.ERR_INVALID_TOKEN, {})
        );
      }
    } else {
      return Promise.reject(
        new Errors.UnAuthorizedError(Errors.ERR_NO_TOKEN, {})
      );
    }
  }

  @Method
  private _getUserFromRemoterService(
    ctx: Moleculer.Context,
    accessToken
  ): Promise<any> {
    return Promise.resolve({ user: {} });
  }
}
