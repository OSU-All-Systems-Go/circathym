import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import process from 'process';

// DB setup
let client: DynamoDBClient;

if (process.env.LOCAL === 'true') {
  client = new DynamoDBClient({
    region: 'local',
    endpoint: 'http://127.0.0.1:8000',
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
} else {
  client = new DynamoDBClient({});
}

const docClient = DynamoDBDocumentClient.from(client);

type Timer = {
  timerId: string;
  appName: string;
  duration: number;
  callbackUrl: string;
  createdAt: string;
  expiresAt: string;
};

// Table name
const TABLE_NAME = process.env.TABLE_NAME || 'timers';

// Set timer
export const setTimeModel = async (req: any, reply: any) => {
  const { appName, duration, callbackUrl } = req.body;

  if (!appName || !duration || !callbackUrl) {
    return reply.status(400).send({
      success: false,
      message: 'Missing required fields',
    });
  }

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + duration * 1000);

  const timer: Timer = {
    timerId: randomUUID(),
    appName,
    duration,
    callbackUrl,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `TIMER#${timer.timerId}`,
        sk: 'METADATA',
        ...timer,
      },
    }),
  );

  return reply.send({
    success: true,
    message: 'Timer created successfully',
    timer,
  });
};

// Get timer
export const getTimerModel = async (req: any, reply: any) => {
  const { timerId } = req.params;

  if (!timerId) {
    return reply.status(400).send({
      success: false,
      message: 'timerId is required',
    });
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `TIMER#${timerId}`,
        sk: 'METADATA',
      },
    }),
  );

  if (!result.Item) {
    return reply.status(404).send({
      success: false,
      message: 'Timer not found',
    });
  }

  return reply.send({
    success: true,
    timer: result.Item,
  });
};

// Reset timer
export const resetTimerModel = async (req: any, reply: any) => {
  const { timerId } = req.body;

  if (!timerId) {
    return reply.status(400).send({
      success: false,
      message: 'timerId is required',
    });
  }

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `TIMER#${timerId}`,
        sk: 'METADATA',
      },
    }),
  );

  return reply.send({
    success: true,
    message: 'Timer reset successfully',
  });
};
