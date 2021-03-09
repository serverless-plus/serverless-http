import { ChildProcess } from 'child_process';
import { join } from 'path';
import http from 'http';
import { ServerlessProxy } from '../src/proxy';
import app from './fixtures/server';
import GetEvent from './fixtures/events/get';
import PostEvent from './fixtures/events/post';
import { ApigwEvent } from '../src/typings';

const appPath = join(__dirname, './fixtures/runtimes/app.mock.ts');
const startCmd = `ts-node ${appPath}`;

describe('ServerlessProxy', () => {
  const server = http.createServer(app);
  test(`[get] Proxy without server option`, async (done) => {
    server.listen(9010, async () => {
      const proxy = new ServerlessProxy({
        port: 9010,
      });
      const res = await proxy.getResponse(GetEvent as ApigwEvent);
      server.close();

      expect(res).toEqual({
        headers: {
          'x-powered-by': 'Express',
          'content-type': 'application/json; charset=utf-8',
          'content-length': expect.any(String),
          etag: expect.any(String),
          date: expect.any(String),
          connection: 'close',
        },
        statusCode: 200,
        body: '{"query":{"foo":"bar","bob":"alice"}}',
        isBase64Encoded: false,
      });

      done();
    });
  });

  test(`[Post] Proxy without server option`, async (done) => {
    server.listen(9011, async () => {
      const proxy = new ServerlessProxy({
        port: 9011,
      });

      const res = await proxy.getResponse(PostEvent as ApigwEvent);
      server.close();

      expect(res).toEqual({
        headers: {
          'x-powered-by': 'Express',
          'content-type': 'application/json; charset=utf-8',
          'content-length': expect.any(String),
          etag: expect.any(String),
          date: expect.any(String),
          connection: 'close',
        },
        statusCode: 200,
        body: '{"body":{"test":"body"}}',
        isBase64Encoded: false,
      });

      done();
    });
  });

  test(`[UDS get] Proxy with server`, async () => {
    const proxy = new ServerlessProxy({
      requestListenser: app,
    });
    await proxy.start();

    const res = await proxy.getResponse(GetEvent as ApigwEvent);
    proxy.server?.close();

    expect(res).toEqual({
      headers: {
        'x-powered-by': 'Express',
        'content-type': 'application/json; charset=utf-8',
        'content-length': expect.any(String),
        etag: expect.any(String),
        date: expect.any(String),
        connection: 'close',
      },
      statusCode: 200,
      body: '{"query":{"foo":"bar","bob":"alice"}}',
      isBase64Encoded: false,
    });
  });

  test(`[UDS Post] Proxy with server`, async () => {
    const proxy = new ServerlessProxy({
      requestListenser: app,
    });
    await proxy.start();

    const res = await proxy.getResponse(PostEvent as ApigwEvent);
    proxy.server?.close();

    expect(res).toEqual({
      headers: {
        'x-powered-by': 'Express',
        'content-type': 'application/json; charset=utf-8',
        'content-length': expect.any(String),
        etag: expect.any(String),
        date: expect.any(String),
        connection: 'close',
      },
      statusCode: 200,
      body: '{"body":{"test":"body"}}',
      isBase64Encoded: false,
    });
  });

  test(`[ChildProcess get] Proxy with server`, async () => {
    const proxy = new ServerlessProxy({
      requestListenser: app,
      useChildProcess: true,
      startCmd,
      port: 9009,
    });
    const cpr = (await proxy.start()) as ChildProcess;

    const res = await proxy.getResponse(GetEvent as ApigwEvent);
    cpr.kill();

    expect(res).toEqual({
      headers: {
        'x-powered-by': 'Express',
        'content-type': 'application/json; charset=utf-8',
        'content-length': expect.any(String),
        etag: expect.any(String),
        date: expect.any(String),
        connection: 'close',
      },
      statusCode: 200,
      body: '{"query":{"foo":"bar","bob":"alice"}}',
      isBase64Encoded: false,
    });
  });

  test(`[ChildProcess Post] Proxy with server`, async () => {
    const proxy = new ServerlessProxy({
      requestListenser: app,
      useChildProcess: true,
      startCmd,
      port: 9009,
    });
    const cpr = (await proxy.start()) as ChildProcess;

    const res = await proxy.getResponse(PostEvent as ApigwEvent);
    cpr.kill();

    expect(res).toEqual({
      headers: {
        'x-powered-by': 'Express',
        'content-type': 'application/json; charset=utf-8',
        'content-length': expect.any(String),
        etag: expect.any(String),
        date: expect.any(String),
        connection: 'close',
      },
      statusCode: 200,
      body: '{"body":{"test":"body"}}',
      isBase64Encoded: false,
    });
  });
});
