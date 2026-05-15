import { FastifyInstance } from 'fastify';
import {
  setTimerSchema,
  getTimerSchema,
  resetTimerSchema,
} from '../schemas/root';
import { setTimeModel, getTimerModel, resetTimerModel } from '../models/root';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });

  // Create timer
  fastify.post('/setTimer', { schema: setTimerSchema }, setTimeModel);

  // Get timer
  fastify.get('/getTimer', { schema: getTimerSchema }, getTimerModel);

  // Reset timer
  fastify.post('/resetTimer', { schema: resetTimerSchema }, resetTimerModel);
}
