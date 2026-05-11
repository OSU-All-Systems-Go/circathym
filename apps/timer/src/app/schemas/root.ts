export const setTimerSchema = {
  description: 'Endpoint doing Set Timer',
  body: {
    type: 'object',
    properties: {
      timername: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
    },
  },
  operationId: 'signup',
  tags: ['timer', 'signup'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        message: {
          type: 'string',
          nullable: true,
        },
      },
    },
    401: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  },
};

export const getTimerSchema = {
  description: 'Endpoint for getting timer information',
  body: {
    type: 'object',
    properties: {
      timerId: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
    },
  },
  operationId: 'getTimer',
  tags: ['timer', 'getTimer'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        message: {
          type: 'string',
          nullable: true,
        },
        token: {
          type: 'string',
        },
      },
    },
    401: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  },
};

export const resetTimerSchema = {
  description: 'Endpoint for resetting timer',
  body: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
      },
    },
  },
  operationId: 'validate',
  tags: ['timer', 'validate'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        isValid: {
          type: 'boolean',
        },
      },
    },
    401: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  },
};
