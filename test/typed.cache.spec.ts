import Moleculer, { ServiceBroker } from 'moleculer';
import { inspect } from 'util';
import { Action, Service } from '../src';

type Params = {
  query: { 
    aa: number,
    obj: {
      sub: string,
      arr: string[]
    }
  },
  pagination: { page: number, pageLength: number },
  bool: boolean;
};

type Meta = {
  auth: { userId: string }
};

const cacheA = {
  ttl: 1,
  enabled: true,
  lock: {
    enabled: false
  }
};
const cacheB = {
  ttl: 3,
  enabled: false,
  lock: {
    enabled: false
  }
};

const untypedKeys = ['aa.bb.cc', '#xx.yy.zz'];

@Service()
export default class TestServcie extends Moleculer.Service {
  @Action<{ meta: Meta, params: Params }>({
    cache: {
      ...cacheA,
      meta: { auth: { userId: true } },
      params: {
        pagination: { page: true, pageLength: true },
        query: { aa: true, obj: { arr: true} },
        bool: true
      }
    }
  })
  typedCache(ctx) {
    return "Hello";
  }

  @Action({
    cache: {
      ...cacheB,
      keys: untypedKeys
    } as any
  })
  oldWayCache(ctx) {
    return "Hello";
  }
}

describe("Action({ cache: ... })", () =>{
  it("Dummy cache test", async () => {

    const broker = new ServiceBroker({ logLevel: "warn" });
    const service = broker.createService(TestServcie);
    
    const typedCache = (service.schema.actions.typedCache as any).cache;
    const oldWayCache = (service.schema.actions.oldWayCache as any).cache;

    expect(typedCache).toStrictEqual({
      ...cacheA,
      keys: [
        "pagination.page",
        "pagination.pageLength",
        "query.aa",
        "query.obj.arr",
        "bool",
        "#auth.userId",
      ]
    });

    // Should not work anymore
    expect(oldWayCache).toStrictEqual({
      ...cacheB,
      keys: []
    });
  })
})