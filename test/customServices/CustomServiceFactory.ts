import { Service } from 'moleculer';

class CustomService extends Service {
  constructor(broker, schema) {
    super(broker, schema)
  }

  foo() {
    return 'bar';
  }
}

export {
    CustomService
}
