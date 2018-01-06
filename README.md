# Moleculer Decorators [![npm version](https://badge.fury.io/js/moleculer-decorators.svg)](https://badge.fury.io/js/moleculer-decorators)
Decorators for moleculer

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