import {
  ServiceSchema,
  Action,
  ActionHandler,
  LoggerInstance,
  ServiceMethods,
  ServiceEvents,
  Actions,
  ServiceSettingSchema,
  GenericObject,
  ServiceBroker,
  ServiceEvent,
  ServiceEventHandler
} from 'moleculer';
import * as _ from 'lodash';


const blacklist = [
  'created',
  'started',
  'stopped',
  'actions',
  'methods',
  'events',
  'broker',
  'logger'
];
const blacklist2 = ['metadata', 'settings', 'mixins', 'name', 'version'].concat(
    blacklist
);
const defaultServiceOptions: Options = {
  constructOverride: true,
  skipHandler: false // not needed, just for clarity
};

/**
 * Don't use this anymore! You need a valid ServiceFactory class instance to extend from.
 * Using BaseSchema will result in an error
 *
 * @deprecated
 */
export class BaseSchema {
  [x: string]: any;

  logger: LoggerInstance;
  name: string;
  broker: ServiceBroker;

  version: string | number;
  settings: ServiceSettingSchema;
  metadata: GenericObject;
  mixins: Array<ServiceSchema>;

  actions: Actions;
  methods: ServiceMethods;
  events: ServiceEvents;
}

export interface Options extends Partial<ServiceSchema> {
  name?: string;
  constructOverride?: boolean;
}

export interface ActionOptions extends Partial<Action> {
  name?: string;
  handler?: ActionHandler<any>; // Not really used
  skipHandler?: boolean;
}

export interface EventOptions extends Partial<ServiceEvent> {
  name?: string;
  group?: string;
  handler?: ServiceEventHandler; // not really used
}

export function Method(target, key, descriptor) {
  (target.methods || (target.methods = {}))[key] = descriptor.value;
}

export function Event(options?: EventOptions) {
  return function(target, key, descriptor) {
    (target.events || (target.events = {}))[key] = options
        ? {
          ...options,
          handler: descriptor.value
        }
        : descriptor.value;
  };
}

export function Action(options: ActionOptions = {}) {
  return function(target, key, descriptor) {
    if (!options.skipHandler) {
      options.handler = descriptor.value;
    } else {
      delete options.skipHandler;
    }

    (target.actions || (target.actions = {}))[key] = options
        ? {
          ...options
        }
        : options.skipHandler
            ? ''
            : descriptor.value;
  };
}

export function Service(options: Options = {}): Function {
  return function(constructor: Function
  ) {

    let base: ServiceSchema = {
      name: '' // will be overridden
    };
    const _options = _.extend({}, defaultServiceOptions, options);

    Object.defineProperty(base, 'name', {
      value: options.name || constructor.name,
      writable: false,
      enumerable: true
    });

    if (options.name) {
      delete options.name; // not needed
    }

    Object.assign(base, _.omit(options, _.keys(defaultServiceOptions))); // Apply

    const parentService = constructor.prototype;
    const vars = [];
    Object.getOwnPropertyNames(parentService).forEach(function(key) {
      if (key === 'constructor') {
        if (_options.constructOverride) {
          // Override properties defined in @Service
          const ServiceClass = new parentService.constructor(new ServiceBroker()); // initializing from Moleculer ServiceFactory class

          Object.getOwnPropertyNames(ServiceClass).forEach(function(key) {
            if (
                blacklist.indexOf(key) === -1 &&
                !_.isFunction(ServiceClass[key])
            ) {
              base[key] = Object.getOwnPropertyDescriptor(
                  ServiceClass,
                  key
              )!.value;
              if (blacklist2.indexOf(key) === -1) {
                // Needed, otherwize if the service is used as a mixin, these variables will overwrite the toplevel's
                vars[key] = Object.getOwnPropertyDescriptor(
                    ServiceClass,
                    key
                )!.value;
              }
            }
          });

          /* Insane hack below :D
          * It's needed since moleculer don't transfer all defined props in the schema to the actual service, so we have to do it.
          * Side note: This is quite hacky and would be a performance loss if the created function would be called over and over, since it's called once, it's more than fine :)
          */

          const bypass: any = Object.defineProperty; // typescript fix
          const obj: any = {}; // placeholder

          // Defining our 'own' created function
          bypass(obj, 'created', {
            value: function created(broker: ServiceBroker) {
              for (let key in vars) {
                this[key] = vars[key];
              }

              // Check if user defined a created function, if so, we need to call it after ours.
              if (!_.isNil(Object.getOwnPropertyDescriptor(parentService, 'created'))) {
                Object.getOwnPropertyDescriptor(parentService, 'created').value.call(
                    this,
                    broker
                );
              }
            },
            writable: true,
            enumerable: true,
            configurable: true
          });

          base['created'] = obj.created;
        }
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(parentService, key)!;

      if (key === 'created' && !_options.constructOverride) {
        base[key] = descriptor.value;
      }

      if (key === 'started' || key === 'stopped') {
        base[key] = descriptor.value;
        return;
      }

      if (key === 'events' || key === 'methods' || key === 'actions') {
        base[key]
            ? Object.assign(base[key], descriptor.value)
            : (base[key] = descriptor.value);
        return;
      }

      // moleculer-db lifecycle methods (https://github.com/ColonelBundy/moleculer-decorators/issues/2)
      if (key === 'afterConnected'
          || key === 'entityCreated'
          || key === 'entityUpdated'
          || key === 'entityRemoved'
      ) {
        base[key] = descriptor.value;
        return;
      }
    });

    return class extends parentService.constructor {
      constructor(broker) {
        super(broker, base);
      }
    }
  };
}
