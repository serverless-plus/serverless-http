export default {
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
};
