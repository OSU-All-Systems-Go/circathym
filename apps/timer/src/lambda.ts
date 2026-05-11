import awsLambdaFastify from '@fastify/aws-lambda';
import { init } from './main';

const proxy = awsLambdaFastify(init());

export const handler = async (event: any, context: any) =>
  proxy(event, context);

export default handler;
