import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import process from 'process';

const dbConfig = {
  maxAttempts: 5,
};

let client: DynamoDBClient;

if (process.env.LOCAL === 'true') {
  console.log('Running in local mode, connecting to local DynamoDB');
  client = new DynamoDBClient({
    ...dbConfig,
    region: 'local',
    endpoint: 'http://127.0.0.1:8000',
    credentials: {
      accessKeyId: 'fakeMbfgo7yKeyId',
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
  lastUpdatedAt: string;
  createdAt: string;
  expiresAt: string;
};

const TABLE_NAME = process.env.TABLE_NAME || 'timers';

export const setTimer = async (req: any, res: any) => {
  const { appName, duration, callbackUrl } = req.body;

  if (!appName || !duration || !callbackUrl) {
    return res.status(400).send({
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
    lastUpdatedAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `${timer.timerId}`,
          sk: appName,
          discriminator: 'TIMER',
          ...timer,
        },
      }),
    );

    return res.send({
      success: true,
      message: 'Timer created successfully',
      timerId: timer.timerId,
    });
  } catch (error) {
    req.log.error('Failed to save timer:', error);

    return res
      .status(502)
      .send({ success: false, message: 'Database store timeout' });
  }
};

export const getAllTimers = async (req: any, res: any) => {
  const { appName } = req.query;

  if (!appName) {
    return res.status(400).send({
      success: false,
      message: 'appName is required',
    });
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'sk-pk-index',
      KeyConditionExpression: '#sk = :appName',
      ExpressionAttributeNames: {
        '#sk': 'sk',
      },
      ExpressionAttributeValues: {
        ':appName': appName,
      },
    }),
  );

  const timers =
    result.Items?.map((item) => ({
      timerId: item.pk,
      duration: item.duration,
      createdAt: item.createdAt,
      expiresAt: item.expiresAt,
    })) || [];

  return res.send({
    success: true,
    timers,
  });
};

export const getTimer = async (req: any, res: any) => {
  const { timerId, appName } = req.query;

  if (!timerId) {
    return res.status(400).send({
      success: false,
      message: 'timerId is required',
    });
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${timerId}`,
        sk: appName,
      },
    }),
  );

  if (!result.Item) {
    return res.status(404).send({ success: false, message: 'Timer not found' });
  }

  return res.send({
    success: true,
    timer: result.Item,
  });
};

export const resetTimer = async (req: any, res: any) => {
  const { timerId, appName } = req.body;

  if (!timerId) {
    return res
      .status(400)
      .send({ success: false, message: 'timerId is required' });
  }

  const existingTimer = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${timerId}`,
        sk: appName,
      },
    }),
  );

  if (!existingTimer.Item) {
    return res.status(404).send({ success: false, message: 'Timer not found' });
  }

  const { duration } = existingTimer.Item;

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + duration * 1000);

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...existingTimer.Item,
        lastUpdatedAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    }),
  );

  return res.send({
    success: true,
    message: 'Timer reset successfully',
  });
};

export const deleteTimer = async (req: any, res: any) => {
  const { timerId, appName } = req.body;

  if (!timerId) {
    return res.status(400).send({
      success: false,
      message: 'timerId is required',
    });
  }

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${timerId}`,
        sk: appName,
      },
    }),
  );
  res.send(200).send({ success: true, message: 'Timer deleted successfully' });
};
