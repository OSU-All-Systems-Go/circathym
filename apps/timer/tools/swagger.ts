const swagFastify = require('fastify');
const swagCors = require('@fastify/cors');
const swagAutoload = require('@fastify/autoload');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const swagPath = require('node:path');
const swaggerOptions = require('./swaggerOptions');

const swagApp = swagFastify({
  logger: true,
  // ajv: {
  //   plugins: [require('../src/plugin/multipart').ajvFilePlugin],
  // },
});

// swagApp.register(require('../src/plugin/multipart'), {
//   attachFieldsToBody: 'keyValues',
// });
swagApp.addContentTypeParser(
  'application/json',
  {},
  (_req: any, body: any, done: any) => {
    done(null, body.body);
  },
);

swagApp.register(swagCors, {
  allowedHeaders: 'Content-Type, Authorization',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  origin: '*',
});
swagApp.register(swagger, {
  swagger: swaggerOptions,
});
swagApp.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest(request: any, reply: any, next: any) {
      next();
    },
    preHandler(request: any, reply: any, next: any) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header: any) => header,
  transformSpecification: (swaggerObject: any, request: any, reply: any) =>
    swaggerObject,
  transformSpecificationClone: true,
});
swagApp.register(swagAutoload, {
  dir: swagPath.join(__dirname, '../src/app/routes'),
  ignorePattern: /^.*(?:test|spec).js$/,
});

swagApp.ready();

swagApp.listen({ port: 3003 }, (err: any, addr: any) => {
  if (err) throw err;
  swagApp.log.info(`Visit the documentation at ${addr}/swagger-docs/`);
});
