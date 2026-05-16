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
const dbConfig = {
  maxAttempts: 5,
};

let client: DynamoDBClient;

if (process.env.LOCAL === 'true') {
  client = new DynamoDBClient({
    ...dbConfig,
    region: 'local',
    endpoint: 'http://127.0.0.1:8000',
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
} else {
  client = new DynamoDBClient(dbConfig);
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

const TABLE_NAME = process.env.TABLE_NAME || 'timers';

// Set timer (User Story 1)
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

  try {
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
  } catch (error) {
    req.log.error('Failed to save timer:', error);

    // Return 502 instead of standard 500; retries should catch most transient drops
    return reply
      .status(502)
      .send({ success: false, message: 'Database store timeout' });
  }
};

// Get timer (User Story 2)
export const getTimerModel = async (req: any, reply: any) => {
  const { timerId } = req.params;

  if (!timerId) {
    return reply.status(400).send({
      success: false,
      message: 'timerId is required',
    });
  }

  try {
    // Single item GetCommand for <200ms latency
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
      return reply
        .status(404)
        .send({ success: false, message: 'Timer not found' });
    }

    return reply.send({
      success: true,
      timer: result.Item,
    });
  } catch (error) {
    req.log.error('Failed to get timer:', error);
    return reply
      .status(500)
      .send({ success: false, message: 'Internal Server Error' });
  }
};

// Reset timer (User Story 3)
export const resetTimerModel = async (req: any, reply: any) => {
  const { timerId } = req.body;

  if (!timerId) {
    return reply
      .status(400)
      .send({ success: false, message: 'timerId is required' });
  }

  try {
    // Partition/sort key targets only the exact record
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
  } catch (error) {
    req.log.error('Failed to reset timer:', error);
    return reply
      .status(500)
      .send({ success: false, message: 'Internal Server Error' });
  }
};
