import {Context, GenericObject} from 'moleculer';
import {Action, BaseSchema, Method, Service} from '../../src';
import {User} from './api.service';
import 'reflect-metadata';
interface ChatsActionParams {
  withUser: string;
}

export interface AuthMeta {
  user: User;
  $statusCode?: number;
}

export interface AuthContext<P = GenericObject> extends Context<P, AuthMeta> {
  meta: AuthMeta;
  params: P;
}

@Service()
class GetTest extends BaseSchema {
  @Action({
    params: {
      withUser: 'string',
    },
  })
  public async getModel(ctx: AuthContext<ChatsActionParams>) {
    const {withUser} = ctx.params;
    const fromUser = ctx.meta.user.id;
    return this._getModel(withUser, fromUser);
  }

  @Method
  private _getModel(withUser: string, fromUser: string): Promise<User> {
    return Promise.resolve({id: '5'});
  }
}

module.exports = (GetTest as Function)();
