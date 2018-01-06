# moleculer-decorators
decorators for moleculer

# Example usage with moleculer-web

```
const moleculer = require('moleculer');
const { Service, Action, Event, Method } = require('moleculer-decorators');
const web = require('moleculer-web');
const broker = new moleculer.ServiceBroker();

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
  @Action
  Login(ctx) {
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

  hello() { // Private;
    ...
  }
}

broker.createService(ServiceName);
broker.start();

```