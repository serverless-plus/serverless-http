import { isBinaryContentType, responseToApigw } from '../src/response';

describe('Response', () => {
  test(`[isBinaryContentType]`, async () => {
    expect(isBinaryContentType([], 'text/plain')).toEqual(false);
    expect(isBinaryContentType(['*/*'], 'text/plain')).toEqual(true);
    expect(isBinaryContentType(['image/png'], 'text/plain')).toEqual(false);
    expect(isBinaryContentType(['image/png'], 'image/png')).toEqual(true);
  });

  const body = Buffer.from('Hello world', 'utf8');

  test(`[responseToApigw] default`, async () => {
    const res = responseToApigw({
      response: {
        statusCode: 200,
        headers: {
          'content-type': 'text/plain',
        },
        body,
      },
    });
    expect(res).toEqual({
      headers: {
        'content-type': 'text/plain',
      },
      statusCode: 200,
      body: body.toString('utf8'),
      isBase64Encoded: false,
    });
  });

  test(`[responseToApigw] binaryTypes`, async () => {
    const res = responseToApigw({
      response: {
        statusCode: 200,
        headers: {
          'content-type': 'text/plain',
        },
        body,
      },
      binaryTypes: ['text/plain'],
    });
    expect(res).toEqual({
      headers: {
        'content-type': 'text/plain',
      },
      statusCode: 200,
      body: body.toString('base64'),
      isBase64Encoded: true,
    });
  });

  test(`[responseToApigw] base64Encoded`, async () => {
    const res = responseToApigw({
      response: {
        statusCode: 200,
        headers: {
          'content-type': 'text/plain',
        },
        body,
      },
      isBase64Encoded: true,
    });
    expect(res).toEqual({
      headers: {
        'content-type': 'text/plain',
      },
      statusCode: 200,
      body: body.toString('utf8'),
      isBase64Encoded: true,
    });
  });

  test(`[responseToApigw] base64Encoded and binaryTypes`, async () => {
    const res = responseToApigw({
      response: {
        statusCode: 200,
        headers: {
          'content-type': 'text/plain',
        },
        body,
      },
      isBase64Encoded: true,
      binaryTypes: ['text/plain'],
    });
    expect(res).toEqual({
      headers: {
        'content-type': 'text/plain',
      },
      statusCode: 200,
      body: body.toString('base64'),
      isBase64Encoded: true,
    });
  });
});
