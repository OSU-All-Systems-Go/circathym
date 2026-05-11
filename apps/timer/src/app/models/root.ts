import { randomBytes, pbkdf2 } from 'node:crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { omit } from '../utils';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

let client;
if (process.env.LOCAL === 'true') {
  client = new DynamoDBClient({
    region: 'local',
    endpoint: 'http://127.0.0.1:8000',
    credentials: {
      accessKeyId: 'fakeMbfgo7yKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
} else {
  client = new DynamoDBClient({});
}
const docClient = DynamoDBDocumentClient.from(client);

export const signUpModel = async (req: any, res: any) => {
  try {
    const { timername, password, email, app = 'waa' } = req.body;
    const salt = randomBytes(16);
    const promisePbkdf2 = promisify(pbkdf2);
    const derivedKey = await promisePbkdf2(
      password,
      salt,
      310000,
      32,
      'sha256',
    );
    const table = process.env.USERS_TABLE_NAME || 'timers';
    const query = new PutCommand({
      TableName: table,
      Item: {
        ...omit(req.body, ['password']),
        hashed_password: derivedKey,
        salt: salt,
        pk: timername || email,
        sk: app,
      },
      ConditionExpression:
        'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    });
    await docClient.send(query);
    res.send({ message: 'Timer created successfully', success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error creating timer', success: false });
  }
};

export const loginModel = async (req: any, res: any) => {
  try {
    const { timername, password, app = 'waa' } = req.body;

    const getRecordCommand = new GetCommand({
      TableName: process.env.USERS_TABLE_NAME || 'timers',
      Key: {
        pk: timername,
        sk: app,
      },
    });
    const queryResult = await docClient.send(getRecordCommand);
    if (!queryResult.Item) {
      res.status(401).send({ message: 'Invalid timername or password' });
      return;
    }
    const { hashed_password, salt } = queryResult.Item;
    const promisePbkdf2 = promisify(pbkdf2);
    const derivedKey = await promisePbkdf2(
      password,
      salt,
      310000,
      32,
      'sha256',
    );

    if (derivedKey.equals(hashed_password)) {
      const payload = {
        ...omit(queryResult.Item, ['hashed_password', 'salt', 'pk', 'sk']),
        timername: queryResult.Item.pk,
        app: queryResult.Item.sk,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'default', {
        expiresIn: '1d',
      });
      res.send({ message: 'Login successful', token, success: true });
    } else {
      res
        .status(401)
        .send({ message: 'Invalid timername or password', success: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error logging in', success: false });
  }
};

export const validateModel = async (req: any, res: any) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default');
    if (!decoded) {
      res.send({ valid: false, success: true });
    }
    const { timername, app } = decoded as any;

    const getRecordCommand = new GetCommand({
      TableName: process.env.USERS_TABLE_NAME || 'timers',
      Key: {
        pk: timername,
        sk: app,
      },
    });
    const queryResult = await docClient.send(getRecordCommand);
    if (!queryResult.Item) {
      res.send({ isValid: false, success: true });
    }
    res.send({ isValid: true, success: true });
  } catch (err) {
    console.log(err);
    res.send({ isValid: false, success: false });
  }
};
