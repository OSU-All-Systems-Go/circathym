import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Mock the database
jest
  .spyOn(DynamoDBDocumentClient.prototype, 'send')
  .mockImplementation(async (command: any) => {
    if (command.constructor.name === 'GetCommand') {
      return {
        Item: {
          timerId: command.input.Key.pk.split('#')[1],
          appName: 'TestApp',
          duration: 3600,
          callbackUrl: 'https://test.com/webhook',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    }
    return {};
  });

describe('Timer Microservice Endpoints', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify();
    await server.register(app);
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /', () => {
    it('should respond with a hello message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Hello API' });
    });
  });

  describe('POST /setTimer', () => {
    it('should create a timer and return 200 (Success Path)', async () => {
      const payload = {
        appName: 'Habit-at',
        duration: 86400,
        callbackUrl: 'https://internal.api/habitat/retry',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/setTimer',
        payload,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Timer created successfully');
      expect(data.timer).toHaveProperty('timerId');
      expect(data.timer.appName).toBe(payload.appName);
      expect(data.timer.duration).toBe(payload.duration);
    });

    it('should return 400 if required fields are missing (Schema Validation)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/setTimer',
        payload: { appName: 'Ops Dashboard' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain(
        "must have required property 'duration'",
      );
    });
  });

  describe('GET /getTimer/:timerId', () => {
    it('should retrieve a timer and return 200 (Success Path)', async () => {
      const testTimerId = 'abc-123-xyz';
      const response = await server.inject({
        method: 'GET',
        url: `/getTimer/${testTimerId}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.success).toBe(true);
      expect(data.timer.timerId).toBe(testTimerId);
    });
  });

  describe('POST /resetTimer', () => {
    it('should reset/delete a timer and return 200 (Success Path)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/resetTimer',
        payload: {
          timerId: 'abc-123-xyz',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Timer reset successfully');
    });

    it('should return 400 if timerId is missing in the body (Schema Validation)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/resetTimer',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain(
        "must have required property 'timerId'",
      );
    });
  });
});
