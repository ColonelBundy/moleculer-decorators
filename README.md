![Moleculer logo](https://raw.githubusercontent.com/ice-services/moleculer/HEAD/docs/assets/logo.png)


[![npm](https://img.shields.io/npm/v/moleculer-decorators.svg)](https://www.npmjs.com/package/moleculer-decorators) 
[![npm](https://img.shields.io/npm/dm/moleculer-decorators.svg)](https://www.npmjs.com/package/moleculer-decorators) 
[![GitHub issues](https://img.shields.io/github/issues/ColonelBundy/moleculer-decorators.svg)](https://github.com/ColonelBundy/moleculer-decorators/issues) 
[![GitHub license](https://img.shields.io/github/license/ColonelBundy/moleculer-decorators.svg)](https://github.com/ColonelBundy/moleculer-decorators/blob/master/LICENSE)
# Moleculer Decorators
Decorators for moleculer

## Available options
```js
constructOverride: false // True by default, This will override any properties defined in @Service if defined in the constructor as well.
```
These are defined in @Service

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
class ServiceName {

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

  // With options
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

  @Event
  'event.name'(payload, sender, eventName) {
    ...
  }

  @Method
  authorize(ctx, route, req, res) {
    ...
  }

  hello() { // Private
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
Simply export the service instead of starting a broker manually.
```js 
  export = ServiceName 
``` 

# License
Moleculer Decorators is available under the [MIT license](https://tldrlegal.com/license/mit-license).