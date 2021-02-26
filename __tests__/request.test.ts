import { eventToRequest } from '../src/request';
import { ApigwEvent } from '../src/typings';

import GetEvent from './fixtures/events/get';
import PostEvent from './fixtures/events/post';

describe('Request', () => {
  test(`[eventToRequest] get`, async () => {
    const req = eventToRequest(GetEvent as ApigwEvent);

    expect(req).toEqual({
      method: 'GET',
      path: '/?foo=bar&bob=alice',
      headers: {
        'Accept-Language': 'en-US,en,cn',
        Accept: 'text/html,application/xml,application/json',
        Host: 'service-xxx-xxx.ap-guangzhou.apigateway.myqloud.com',
        'User-Agent': 'User Agent String',
        'X-Forwarded-For': '127.0.0.1',
      },
      body: Buffer.from([]),
    });
  });
  test(`[eventToRequest] post`, async () => {
    const req = eventToRequest(PostEvent as ApigwEvent);

    expect(req).toEqual({
      method: 'POST',
      path: '/',
      headers: {
        'Accept-Language': 'en-US,en,cn',
        'content-type': 'application/json',
        Host: 'service-xxx-xxx.ap-guangzhou.apigateway.myqloud.com',
        'User-Agent': 'User Agent String',
        'X-Forwarded-For': '127.0.0.1',
        'Content-Length': '15',
      },
      body: Buffer.from(PostEvent.body, 'utf8'),
    });
  });
});
