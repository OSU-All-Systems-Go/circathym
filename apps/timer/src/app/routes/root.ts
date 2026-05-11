import { FastifyInstance } from 'fastify';
import { setTimerSchema, getTimerSchema, resetTimerSchema } from '../schemas/root';
import { setTimeModel, getTimerModel, resetTimerModel } from '../models/root';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });

  fastify.post('/setTimer', { schema: setTimerSchema }, setTimeModel);
  fastify.post('/getTimer', { schema: getTimerSchema }, getTimerModel);
  fastify.post('/resetTimer', { schema: resetTimerSchema }, resetTimerModel);
}
