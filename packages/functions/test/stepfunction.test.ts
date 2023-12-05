import { describe, it, expect } from 'vitest';
import { fetchStateMachine, testState } from './util';
import { Config } from 'sst/node/config';
import { states } from '../../../stacks/StepFunction';

describe('[accountUpgrade]', async () => {
  const stateMachine = await fetchStateMachine(Config.StepFunctionArn);

  describe('[CheckCreditBalance]', async () => {
    it('returns credit balance', async () => {
      const res = await testState({
        stateMachineDefinition: stateMachine.definition,
        roleArn: stateMachine.roleArn,
        taskName: states.CheckCreditBalance,
        input: JSON.stringify({
          cost: 75,
        }),
      });

      expect(res.status).toBe('SUCCEEDED');
      expect(res.nextState).toBe('Choice');

      const output = JSON.parse(res.output || '{}');
      expect(output.Payload).toEqual({
        credits: expect.any(Number),
        cost: 75,
      });
    });
  });

  describe('[Choice]', async () => {
    it('flows to account upgrade if credit balance more than cost', async () => {
      const res = await testState({
        stateMachineDefinition: stateMachine.definition,
        roleArn: stateMachine.roleArn,
        taskName: 'Choice',
        input: JSON.stringify({
          Payload: {
            cost: 75,
            credits: 100,
          },
        }),
      });

      expect(res.status).toBe('SUCCEEDED');
      expect(res.nextState).toBe('UpgradeAccount');
    });
  });
});
