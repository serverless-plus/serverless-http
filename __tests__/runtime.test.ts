import { Server } from 'http';
import { ServerlessProxy, TencentRuntime } from '../src';
import RuntimeMockServer from './fixtures/runtimes/tencent.mock';
import app from './fixtures/server';

describe('Serverless Runtime', () => {
  const proxy = new ServerlessProxy({
    requestListenser: app,
  });
  const runtime = new TencentRuntime({
    debug: true,
    proxy,
  });

  let proxyServer: Server;
  beforeAll(async () => {
    RuntimeMockServer.listen(9001);
    proxyServer = (await proxy.start()) as Server;
  });
  afterAll(async () => {
    RuntimeMockServer.close();
    proxyServer.close();
  });

  test(`ready()`, async () => {
    const readyRes = await runtime.ready();

    expect(readyRes).toEqual(
      JSON.stringify({
        message: 'ready',
      }),
    );
  });

  test(`event()`, async () => {
    const event = await runtime.event();

    expect(event).toEqual({
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

  test(`run()`, async () => {
    const runRes = await runtime.run();
    expect(JSON.parse(runRes)).toEqual({
      body: {
        headers: {
          'x-powered-by': 'Express',
          'content-type': 'application/json; charset=utf-8',
          'content-length': '37',
          etag: expect.any(String),
          date: expect.any(String),
          connection: 'close',
        },
        statusCode: 200,
        body: '{"query":{"foo":"bar","bob":"alice"}}',
        isBase64Encoded: false,
      },
    });
  });

  test(`error()`, async () => {
    const errorRes = await runtime.error({ message: 'error test' });
    expect(JSON.parse(errorRes)).toEqual({
      message: 'error test',
    });
  });
});
