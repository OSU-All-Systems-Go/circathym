export const setTimerSchema = {
  description: 'Create a new timer',
  body: {
    type: 'object',
    required: ['appName', 'duration', 'callbackUrl'],
    properties: {
      appName: { type: 'string' },
      duration: { type: 'number' },
      callbackUrl: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timer: { type: 'object' },
      },
    },
  },
};

export const getTimerSchema = {
  description: 'Get timer by ID',
  params: {
    type: 'object',
    required: ['timerId'],
    properties: {
      timerId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        timer: { type: 'object' },
      },
    },
  },
};

export const resetTimerSchema = {
  description: 'Delete/reset a timer',
  body: {
    type: 'object',
    required: ['timerId'],
    properties: {
      timerId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};
