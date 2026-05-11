const options: any = {
  info: {
    title: 'CRT Api',
    version: '0.0.1',
  },
  servers: [
    {
      url: 'http://localhost',
      description: 'Local development',
    },
  ],
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [{ name: 'Default', description: 'Default' }],
  'x-bff-retries': {
    strategy: 'backoff',
    backoff: {
      initialInterval: 500,
      maxInterval: 60000,
      maxElapsedTime: 3600000,
      exponent: 1.5,
    },
    statusCodes: ['5XX'],
    retryConnectionErrors: true,
  },
  components: {
    securitySchemes: [
      {
        bearerFormat: 'JWT',
        scheme: 'bearer',
        type: 'http',
      },
    ],
  },
};

export default options;
