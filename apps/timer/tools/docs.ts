import autoload from '@fastify/autoload';
import fastifySwagger from '@fastify/swagger';
import fp from 'fastify-plugin';
import path from 'path';

import swaggerOptions from './swaggerOptions';

// Pass --options via CLI arguments in command to enable these options.
export const options = {
  logging: true,
  ajv: {
    // plugins: [require('../src/plugin/multipart').ajvFilePlugin],
    customOptions: {
      strict: false, //  Disables Ajv's strict mode
    },
  },
};

export const pluginOptions = {
  logging: true,
  ajv: {
    // plugins: [require('../src/plugin/multipart').ajvFilePlugin],
    customOptions: {
      strict: false, //  Disables Ajv's strict mode
    },
  },
};

export default fp(async (fastify, opt) => {
  // fastify.register(require('../src/plugin/multipart'), {
  //   attachFieldsToBody: 'keyValues',
  // });

  fastify.register(fastifySwagger, {
    openapi: swaggerOptions,
  });
  fastify.register(autoload, {
    dir: path.join(__dirname, '../src/routes'),
    ignorePattern: /^.*(?:test|spec).js$/,
  });
});
