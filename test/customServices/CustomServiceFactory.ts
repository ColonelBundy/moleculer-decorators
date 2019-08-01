import { Service } from 'moleculer';

export class CustomService extends Service {
  constructor(broker, schema) {
    super(broker, schema);
  }

  foo() {
    return 'bar';
  }
}
