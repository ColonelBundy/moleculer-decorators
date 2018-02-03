import { ServiceSchema, Action, ActionHandler } from 'moleculer';

const blacklist = ['created', 'started', 'stopped', 'actions', 'methods', 'events'];

export interface Options extends Partial<ServiceSchema> {
  name?: string
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

    if (options.mixins) {
      options.mixins.forEach((mixin, index) => {
        options.mixins[index].name = options.name || target.name; // must override mixins name
      });
    }

    Object.defineProperty(base, 'name', {
      value: options.name || target.name,
      writable: false,
      enumerable: true
    });

    if (options.name) {
      delete options.name; // not needed
    }

    Object.assign(base, options); // Apply

    const proto = target.prototype;
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      if (key === 'constructor') { // assign items in constructor to base
        const ServiceClass = new target.prototype[key];
        Object.getOwnPropertyNames(ServiceClass).forEach(function(key) {
          if (blacklist.indexOf(key) === -1 && typeof ServiceClass[key] !== 'function') {
            base[key] = Object.getOwnPropertyDescriptor(ServiceClass, key)!.value
          }
        });
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
