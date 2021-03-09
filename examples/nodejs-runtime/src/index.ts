import express, { Request, Response } from 'express';
import { ServerlessProxy } from '@slsplus/serverless-http';
import { ApigwEvent } from '@slsplus/serverless-http/dist/typings';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Serverless Express');
});

const proxy = new ServerlessProxy({
  requestListenser: app,
});

exports.handler = async (event: ApigwEvent) => {
  await proxy.start();
  const res = await proxy.getResponse(event);
  return res;
};
