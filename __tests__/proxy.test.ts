import http from 'http';
import { ServerlessProxy } from '../src/proxy';
import app from './fixtures/server';
import GetEvent from './fixtures/events/get';
import PostEvent from './fixtures/events/post';
import { ApigwEvent } from '../src/typings';

describe('ServerlessProxy', () => {
  const server = http.createServer(app);
  test(`[get] Proxy without server option`, async (done) => {
    server.listen(9000, async () => {
      const proxy = new ServerlessProxy();
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

  test(`[get] Proxy with server`, async () => {
    const proxy = new ServerlessProxy({
      requestListenser: app,
    });

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

  test(`[Post] Proxy without server option`, async (done) => {
    server.listen(9000, async () => {
      const proxy = new ServerlessProxy();

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

  test(`[Post] Proxy with server`, async () => {
    const proxy = new ServerlessProxy({
      requestListenser: app,
    });

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
});
