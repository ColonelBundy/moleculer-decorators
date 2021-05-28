import { ActionCacheOptions, ActionSchema, RestSchema } from 'moleculer';
import dCopy from 'deep-copy';

type ActionSchemaNoCache = Pick<
  ActionSchema,
    | 'name'
    | 'visibility'
    | 'params'
    | 'service'
    | 'handler'
    | 'tracing'
    | 'bulkhead'
    | 'circuitBreaker'
    | 'retryPolicy'
    | 'fallback'
    | 'hooks'
> & { [key: string]: any };

export type ActionOptions<T extends ParamsMeta = {}> = ActionSchemaNoCache & {
  cache?: boolean | ActionCache<T>;
} & {
  skipHandler?: boolean; // internal use only
  rest?: string | string[] | RestSchema;
};

type ActionCacheNoKeys = Omit<ActionCacheOptions, 'keys'>;

type Primitive = boolean | number | string | Symbol;

type CacheKeys<T extends Object | undefined> = T extends undefined
  ? never
  : {
      [P in keyof T]?: T[P] extends Primitive
        ? true
        : T[P] extends Array<Primitive>
        ? true
        : T[P] extends Array<Object>
        ? CacheKeys<T[P][number]>
        : CacheKeys<T[P]>;
    };

type Dict = object;// { [key: string]: any };

type ParamsMeta = { params?: Dict; meta?: Dict };

type ActionCache<T extends ParamsMeta> = ActionCacheNoKeys & {
  params?: T['params'] extends Dict | Primitive
    ? CacheKeys<T['params']>
    : never;
  meta?: T['meta'] extends Dict | Primitive ? CacheKeys<T['meta']> : never;
};

// -----------------------------------------------------
//  Custom cache object to moleculer cache.keys array
//
function cacheKeysToKeysArray(
  object: CacheKeys<any> | Primitive,
  internal: {
    currentPath: string;
    allPaths: string[];
  } = {
    currentPath: '',
    allPaths: []
  }
): string[] {
  const { currentPath, allPaths } = internal;
  if (typeof object !== 'object') {
    return allPaths;
  }

  Object.entries(object).forEach(([key, value]) => {
    const valuePath = currentPath ? `${currentPath}.${key}` : key;
    if (value === true) {
      allPaths.push(valuePath);
    }
    if (typeof value === 'object') {
      cacheKeysToKeysArray(value, { allPaths, currentPath: valuePath });
    }
  });

  return allPaths;
}

export function cacheObjectToKeysArray<T extends ParamsMeta>(args: {
  params?: CacheKeys<T['params']> | Primitive;
  meta?: CacheKeys<T['meta']> | Primitive;
}) {
  const cacheKeys: string[] = [];

  const paramsKeys = cacheKeysToKeysArray(args.params || {});
  const metaKeys = cacheKeysToKeysArray(args.meta || {}).map(
    key => `#${key}`
  );

  cacheKeys.push(...paramsKeys, ...metaKeys);

  return cacheKeys;
}

// -----------------------------------------------------
//  Action decorator
//
export function Action<T extends ParamsMeta>(options: ActionOptions<T> = {}) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const optionsCopy = dCopy(options);

    if (typeof optionsCopy.cache === 'object') {
      const cacheKeys = cacheObjectToKeysArray<T>({ meta: optionsCopy.cache.meta, params: optionsCopy.cache.params });
      ((optionsCopy.cache as any).keys as string[]) = cacheKeys;

      // To be compatible with original moleculer options
      delete optionsCopy.cache.params;
      delete optionsCopy.cache.meta;
    }

    if (!optionsCopy.skipHandler) {
      optionsCopy.handler = descriptor.value;
    } else {
      delete optionsCopy.skipHandler;
    }

    ((target as any).actions || ((target as any).actions = {}))[key] = optionsCopy
      ? {
          ...optionsCopy
        }
      : (optionsCopy as any)?.skipHandler
      ? ''
      : descriptor.value;
  };
}