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
        timerId: { type: 'string' },
      },
    },
  },
};

export const getAllTimerSchema = {
  description: 'Get all timer by ID',
  params: {
    type: 'object',
    properties: {
      appName: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        timers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timerId: { type: 'string' },
              duration: { type: 'number' },
              createdAt: { type: 'string' },
              expiresAt: { type: 'string' },
              lastUpdatedAt: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const getTimerSchema = {
  description: 'Get timer by ID',
  params: {
    type: 'object',
    properties: {
      appName: { type: 'string' },
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
      appName: { type: 'string' },
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

export const deleteTimerSchema = {
  description: 'Delete a timer',
  body: {
    type: 'object',
    required: ['timerId'],
    properties: {
      timerId: { type: 'string' },
      appName: { type: 'string' },
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
