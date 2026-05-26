import Fastify from 'fastify';
import { app } from './app/app';
import fastifyPassport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';
import fs from 'node:fs';
import path from 'node:path';
import passportJwt from 'passport-jwt';
import cors from '@fastify/cors';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const handler = () => {
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

  // Instantiate Fastify with some config
  const server = Fastify({
    logger: true,
  });

  server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  server.register(fastifySecureSession, {
    key:
      process.env.SESSION_SECRET_KEY !== undefined
        ? fs.readFileSync(path.join(__dirname, process.env.SESSION_SECRET_KEY))
        : fs.readFileSync(path.join(__dirname, '../../../assets/secret-key')),
  });
  server.register(fastifyPassport.initialize());
  server.register(fastifyPassport.secureSession());

  // Register your application as a normal plugin.
  server.register(app);

  fastifyPassport.use(
    'jwt',
    new passportJwt.Strategy(
      {
        jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'default',
      },
      async (payload, done) => {
        try {
          const getRecordCommand = new GetCommand({
            TableName: process.env.USERS_TABLE_NAME || 'timers',
            Key: {
              pk: payload.timername,
              sk: payload.app,
            },
          });
          const queryResult = await docClient.send(getRecordCommand);
          if (!queryResult.Item) {
            return done(null, false);
          }
          const timer = { timername: payload.timername, app: payload.app };
          done(null, timer);
        } catch (err) {
          done(err);
        }
      },
    ),
  );
  return server;
};

const bootstrap = async () => {
  try {
    const { HOST = 'localhost', PORT = 3001 } = process.env;
    const server = handler();
    await server.listen({ port: Number(PORT), host: HOST });
    console.log(`[ ready ] http://${HOST}:${PORT}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.env.LOCAL === 'true') {
  bootstrap();
}

export const init = () => {
  const server = handler();
  return server;
};
