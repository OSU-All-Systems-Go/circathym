import { FastifyInstance } from 'fastify';
import {
  setTimerSchema,
  getTimerSchema,
  resetTimerSchema,
  getAllTimerSchema,
  deleteTimerSchema,
} from '../schemas/root';
import {
  setTimer,
  getTimer,
  getAllTimers,
  resetTimer,
  deleteTimer,
} from '../models/root';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });

  fastify.post('/setTimer', { schema: setTimerSchema }, setTimer);
  fastify.get('/getTimer', { schema: getTimerSchema }, getTimer);
  fastify.post('/resetTimer', { schema: resetTimerSchema }, resetTimer);
  fastify.get('/getAllTimers', { schema: getAllTimerSchema }, getAllTimers);
  fastify.post('/deleteTimer', { schema: deleteTimerSchema }, deleteTimer);
}
