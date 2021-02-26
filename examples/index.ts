import http from 'http';
import express, { Request, Response } from 'express';
import { ServerlessProxy } from '../src';
import { ApigwEvent } from '../src/typings';
import GetEvent from '../__tests__/fixtures/events/get';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Serverless Express');
});

const server = http.createServer(app);

const proxy = new ServerlessProxy({
  server,
});

proxy.getResponse(GetEvent as ApigwEvent).then((res) => {
  console.log(res);
  server.close();
});
