import http from 'http';
import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());

app.get('/', (req: Request, res: Response) => {
  res.send({
    msg: 'Mock runtime server',
  });
});

// 以下路由为了本地开发测试
app.post('/runtime/init/ready', (req: Request, res: Response) => {
  res.send({
    message: 'ready',
  });
});

app.post('/runtime/invocation/response', (req: Request, res: Response) => {
  const { body } = req;
  console.log('Apigw response', body);

  res.send({
    body,
  });
});

app.post('/runtime/invocation/error', (req: Request, res: Response) => {
  const { body } = req;
  console.log('Apigw error', body);

  res.send(body);
});

app.get('/runtime/invocation/next', (req: Request, res: Response) => {
  res.send({
    isBase64Encoded: false,
    requestContext: {
      serviceId: 'service-xxx',
      path: '/',
      httpMethod: 'GET',
      requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
      identity: {
        secretId: 'abdcdxxxxxxxsdfs',
      },
      sourceIp: '127.0.0.1',
      stage: 'release',
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en,cn',
      Accept: 'text/html,application/xml,application/json',
      Host: 'service-xxx-xxx.ap-guangzhou.apigateway.myqloud.com',
      'User-Agent': 'User Agent String',
    },
    body: '',
    pathParameters: {},
    queryStringParameters: {},
    headerParameters: {
      Refer: '10.0.2.14',
    },
    stageVariables: {
      stage: 'release',
    },
    path: '/',
    queryString: {
      foo: 'bar',
      bob: 'alice',
    },
    httpMethod: 'GET',
  });
});

const server = http.createServer(app);

export default server;
