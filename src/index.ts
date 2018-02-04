import { ServiceSchema, Action, ActionHandler } from 'moleculer';
import * as _ from 'lodash';

const blacklist = ['created', 'started', 'stopped', 'actions', 'methods', 'events'];
const defaultServiceOptions: Options = {
  constructOverride: true
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
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      if (key === 'constructor') {
        if (_options.constructOverride) { // Override properties defined in @Service
          const ServiceClass = new target.prototype[key];

          Object.getOwnPropertyNames(ServiceClass).forEach(function(key) {
            if (blacklist.indexOf(key) === -1 && !_.isFunction(ServiceClass[key])) {
              base[key] = Object.getOwnPropertyDescriptor(ServiceClass, key)!.value
            }
          });
        }

        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(proto, key)!

      if (key === 'created' || key === 'started' || key === 'stopped') {
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