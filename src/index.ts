import { ServiceSchema, Action, ActionHandler, LoggerInstance, ServiceMethods, ServiceEvents, Actions, Context, ServiceSettingSchema, GenericObject } from 'moleculer';
import * as _ from 'lodash';
import Bluebird = require('bluebird');

const blacklist = ['created', 'started', 'stopped', 'actions', 'methods', 'events'];
const blacklist2 = ['metadata', 'settings', 'mixins', 'name', 'version'].concat(blacklist);
const defaultServiceOptions: Options = {
  constructOverride: true
}

export class BaseSchema {
  logger: LoggerInstance;
  name: string;
  version?: string | number;
  settings?: ServiceSettingSchema;
  metadata?: GenericObject;
  mixins?: Array<ServiceSchema>;

  actions?: Actions;
  methods?: ServiceMethods;
  events?: ServiceEvents;
}

export interface Options extends Partial<ServiceSchema> {
  name?: string
  constructOverride?: boolean
}

export interface ActionOptions extends Partial<Action> {
  name?: string,
  handler?: ActionHandler // Not really used
}

export function Method(target, key, descriptor) {
  (target.methods || (target.methods = {}))[key] = descriptor.value
}

export function Event(target, key, descriptor) {
  (target.events || (target.events = {}))[key] = descriptor.value
}

export function Action(options: ActionOptions = {}) {
  return function(target, key, descriptor) {
    (target.actions || (target.actions = {}))[key] = (options ? {
      ...options,
      handler: descriptor.value
    } : descriptor.value);
  }
}

export function Service(options: Options = {}) : any {
  return function(target) {
    let base = {}
    const _options = _.extend({}, defaultServiceOptions, options);

    Object.defineProperty(base, 'name', {
      value: options.name || target.name,
      writable: false,
      enumerable: true
    });

    if (options.name) {
      delete options.name; // not needed
    }

    Object.assign(base, _.omit(options, _.keys(defaultServiceOptions))); // Apply

    const proto = target.prototype;
    const vars = [];
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      if (key === 'constructor') {
        if (_options.constructOverride) { // Override properties defined in @Service
          const ServiceClass = new target.prototype[key];

          Object.getOwnPropertyNames(ServiceClass).forEach(function(key) {
            if (blacklist.indexOf(key) === -1 && !_.isFunction(ServiceClass[key])) {
              base[key] = Object.getOwnPropertyDescriptor(ServiceClass, key)!.value
              if (blacklist2.indexOf(key) === -1) { // Needed, otherwize if the service is used as a mixin, these variables will overwrite the toplevel's
                vars[key] = Object.getOwnPropertyDescriptor(ServiceClass, key)!.value
              }
            }
          });
        
          /* Insane hack below :D
          * It's needed since moleculer don't transfer all defined props in the
          * schema to the actual service, so we have to do it.
          */ 
          const bypass: any = Object.defineProperty, // typescript fix
                obj: any = {}; // placeholder

          bypass(obj, 'created', {
            value: function created() {
              for (let key in vars) { 
                this[key] = vars[key];
              }
              
              if (!_.isNil(Object.getOwnPropertyDescriptor(proto, 'created'))) {
                Object.getOwnPropertyDescriptor(proto, 'created').value.call(this);
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

      const descriptor = Object.getOwnPropertyDescriptor(proto, key)!

      if (key === 'created' && !_options.constructOverride) {
        base[key] = descriptor.value;
      }

      if (key === 'started' || key === 'stopped') {
        base[key] = descriptor.value;
        return;
      }

      if (key === 'events' || key === 'methods' || key === 'actions') {
        (base[key] ? Object.assign(base[key], descriptor.value) : base[key] = descriptor.value)
        return;
      }
    });

    return base;
  }
}