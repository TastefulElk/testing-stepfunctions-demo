import {
  DescribeStateMachineCommand,
  SFNClient,
  TestStateCommand,
} from '@aws-sdk/client-sfn';

const client = new SFNClient({});

interface TestStateInput {
  stateMachineDefinition: string;
  roleArn: string;
  taskName: string;
  input?: string;
}

export const fetchStateMachine = async (stateMachineArn: string) => {
  const stateMachine = await client.send(
    new DescribeStateMachineCommand({
      stateMachineArn: stateMachineArn,
    })
  );

  if (!stateMachine.definition) {
    throw new Error('State machine definition not found');
  }

  if (!stateMachine.roleArn) {
    throw new Error('State machine roleArn not found');
  }

  return {
    definition: stateMachine.definition,
    roleArn: stateMachine.roleArn,
  };
};

const getTask = (taskName: string, definition: string) => {
  const task = JSON.parse(definition).States[taskName];
  if (!task) {
    throw new Error(`Task ${taskName} not found`);
  }
  
  return JSON.stringify(task);
};

export const testState = async ({
  roleArn,
  stateMachineDefinition,
  taskName,
  input,
}: TestStateInput) => {
  const task = getTask(taskName, stateMachineDefinition);

  return await client.send(
    new TestStateCommand({
      definition: task,
      roleArn: roleArn,
      input: input,
    })
  );
};
