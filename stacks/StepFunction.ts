import {
  Chain,
  Choice,
  Condition,
  Fail,
  StateMachine,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { StackContext, Function, Config } from 'sst/constructs';

export const states = {
  CheckCreditBalance: 'CheckCreditBalance',
  Choice: 'Choice',
  UpgradeAccount: 'UpgradeAccount',
  Cleanup: 'Cleanup',
  DenyUpgrade: 'DenyUpgrade',
  Fail: 'Fail',
};

export function StepFunction({ stack }: StackContext) {
  const checkCreditBalance = new LambdaInvoke(
    stack,
    states.CheckCreditBalance,
    {
      lambdaFunction: new Function(stack, 'CheckCreditBalanceFn', {
        handler: 'packages/functions/src/checkCreditBalance.handler',
      }),
    }
  );

  const choice = new Choice(stack, states.Choice);

  const upgradeAccount = new LambdaInvoke(stack, states.UpgradeAccount, {
    lambdaFunction: new Function(stack, 'UpgradeAccountFn', {
      handler: 'packages/functions/src/upgradeAccount.handler',
    }),
  });

  const denyUpgrade = new LambdaInvoke(stack, states.DenyUpgrade, {
    lambdaFunction: new Function(stack, 'DenyUpgradeFn', {
      handler: 'packages/functions/src/denyUpgrade.handler',
    }),
  });

  const cleanup = new LambdaInvoke(stack, states.Cleanup, {
    lambdaFunction: new Function(stack, 'CleanupFn', {
      handler: 'packages/functions/src/cleanup.handler',
    }),
  });

  const fail = new Fail(stack, states.Fail);

  const definition = Chain.start(
    checkCreditBalance.next(
      choice
        .when(
          Condition.numberGreaterThanEqualsJsonPath(
            '$.Payload.credits',
            '$.Payload.cost'
          ),
          upgradeAccount.addCatch(cleanup.next(fail))
        )
        .otherwise(denyUpgrade)
    )
  );
  const stateMachine = new StateMachine(stack, 'StepFunction', {
    definition,
  });

  new Config.Parameter(stack, 'StepFunctionArn', {
    value: stateMachine.stateMachineArn,
  });
}
