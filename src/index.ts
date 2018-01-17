import { ServiceSchema } from 'moleculer';

export interface Options extends Partial<ServiceSchema> {
  name?: string
}

export function Method(target, key, descriptor) {
  (target.methods || (target.methods = {}))[key] = descriptor.value
}

export function Event(target, key, descriptor) {
  (target.events || (target.events = {}))[key] = descriptor.value
}

export function Action(options?: any) {
  return function(target, key, descriptor) {
    (target.actions || (target.actions = {}))[key] = (options ? {
      ...options,
      handler: descriptor.value
    } : descriptor.value);
  }
}

export function Service(options?: Options) {
  return function(target) {

    if (options.mixins) {
      options.mixins.forEach((mixin, index) => {
        options.mixins[index].name = options.name || target.name; // must override mixins name
      });
    }

    Object.defineProperty(target, 'name', {
      value: options.name || target.name,
      writable: false,
      enumerable: true
    });

    if (options.name) {
      delete options.name; // not needed
    }

    Object.assign(target, options); // Apply

    const proto = target.prototype;
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      if (key === 'constructor') { // skip constructor
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(proto, key)!

      if (key === 'created' || key === 'started' || key === 'stopped') {
        target[key] = descriptor.value;
        return;
      }

      if (key === 'events' || key === 'methods' || key === 'actions') {
        (target[key] ? Object.assign(target[key], descriptor.value) : target[key] = descriptor.value)
        return;
      }
    });
  }
}
