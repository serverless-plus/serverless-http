export default {
  requestContext: {
    serviceId: 'service-xxx',
    path: '/',
    httpMethod: 'POST',
    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    identity: {
      secretId: 'abdcdxxxxxxxsdfs',
    },
    sourceIp: '127.0.0.1',
    stage: 'release',
  },
  headers: {
    'content-type': 'application/json',
    'Accept-Language': 'en-US,en,cn',
    Host: 'service-xxx-xxx.ap-guangzhou.apigateway.myqloud.com',
    'User-Agent': 'User Agent String',
  },
  body: '{"test":"body"}',
  pathParameters: {},
  queryStringParameters: {},
  headerParameters: {
    Refer: '10.0.2.14',
  },
  stageVariables: {
    stage: 'release',
  },
  path: '/',
  queryString: {},
  httpMethod: 'POST',
};
