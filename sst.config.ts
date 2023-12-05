import { SSTConfig } from "sst";
import { StepFunction } from './stacks/StepFunction';

export default {
  config(_input) {
    return {
      name: 'testing-stepfunctions-demo',
      region: 'eu-north-1',
    };
  },
  stacks(app) {
    app.stack(StepFunction);
  },
} satisfies SSTConfig;
