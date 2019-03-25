![Moleculer logo](https://raw.githubusercontent.com/ice-services/moleculer/HEAD/docs/assets/logo.png)


[![npm](https://img.shields.io/npm/v/moleculer-decorators.svg)](https://www.npmjs.com/package/moleculer-decorators) 
[![npm](https://img.shields.io/npm/dm/moleculer-decorators.svg)](https://www.npmjs.com/package/moleculer-decorators) 
[![GitHub issues](https://img.shields.io/github/issues/ColonelBundy/moleculer-decorators.svg)](https://github.com/ColonelBundy/moleculer-decorators/issues) 
[![GitHub license](https://img.shields.io/github/license/ColonelBundy/moleculer-decorators.svg)](https://github.com/ColonelBundy/moleculer-decorators/blob/master/LICENSE)
[![Powered by moleculer](https://img.shields.io/badge/Powered%20by-Moleculer-green.svg?colorB=0e83cd)](http://moleculer.services/)
# Moleculer Decorators
> Decorators for moleculer, Tested & accurate as of 0.13

## Available options
```js
constructOverride: false // True by default, This will override any properties defined in @Service if defined in the constructor as well.
skipHandler: true // false by default, this will let a mixin override the handler in an action. (action options)
```
> These are defined in @Service

# Example usage

```js
const moleculer = require('moleculer');
const { Service, Action, Event, Method } = require('moleculer-decorators');
const web = require('moleculer-web');
const broker = new moleculer.ServiceBroker({
  logger: console,
  logLevel: "debug",
});

@Service({
  mixins: [web],
  settings: {
    port: 3000,
    routes: [
      ...
    ]
  }
})
class ServiceName extends moleculer.Service {

  // Optional constructor
  constructor() {
    this.settings = { // Overrides above by default, to prevent this, add "constructOverride: false" to @Service
      port: 3001
    }
  }

  // Without constructor (typescript)
  settings = {
    port: 3001
  }

  @Action()
  Login(ctx) {
    ...
  }

  @Action({
    skipHandler: true // Any options will be merged with the mixin's action.
  })
  Login3() { // this function will never be called since a mixin will override it, unless you specify skipHandler: false.

  }

  // With options
  // No need for "handler:{}" here
  @Action({
    cache: false,
    params: {
      a: "number",
      b: "number"
    }
  })
  Login2(ctx) {
    ...
  }

  @Event({
    group: 'group_name'
  })
  'event.name'(payload, sender, eventName) {
    ...
  }

  @Event()
  'event.name'(payload, sender, eventName) {
    ...
  }

  @Method
  authorize(ctx, route, req, res) {
    ...
  }

  started() { // Reserved for moleculer, fired when started
    ...
  }

  created() { // Reserved for moleculer, fired when created
    ...
  }

  stopped() { // Reserved for moleculer, fired when stopped
    ...
  }
}

broker.createService(ServiceName);
broker.start();
```

# Usage with moleculer-runner
> Simply export the service instead of starting a broker manually.    
> It must be a commonjs module.
```js 
  module.exports = ServiceName 
``` 

## Usage with custom ServiceFactory class
> Moleculer allows you to define your own ServiceFactory class, from which your services should inherit. 
> All you have to do, is pass your custom ServiceFactory to broker options and also extend your services from this class 
```js
const moleculer = require('moleculer');
const { Service, Action } = require('moleculer-decorators');

// create new service factory, inheriting from moleculer native Service
class CustomService extends moleculer.Service {
    constructor(broker, schema) {
        super(broker, schema)
    }

    foo() {
        return 'bar';
    }
}

// pass your custom service factory to broker options
const broker = new moleculer.ServiceBroker({
  ServiceFactory: CustomService
});

@Service()
class ServiceName extends CustomService { // extend your service from your custom service factory
  @Action()
  Bar(ctx) {
    return this.foo();
  }
}

broker.createService(CustomService);
broker.start();
```

# License
Moleculer Decorators is available under the [MIT license](https://tldrlegal.com/license/mit-license).
