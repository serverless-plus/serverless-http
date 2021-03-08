# Serverless HTTP Proxy

[![npm](https://img.shields.io/npm/v/@slsplus/serverless-http)](http://www.npmtrends.com/@slsplus/serverless-http)
[![NPM downloads](http://img.shields.io/npm/dm/@slsplus/serverless-http.svg?style=flat-square)](http://www.npmtrends.com/@slsplus/serverless-http)
[![Status](https://github.com/serverless-plus/serverless-http/workflows/Test/badge.svg?branch=master)](https://github.com/serverless-plus/serverless-http/actions?query=workflow:Test+branch:master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Serverless HTTP Proxy.

## Usage

```bash
$ npm i @slsplus/serverless-http --save
```

```js
import http from 'http';
import express from 'express';
import { ServerlessProxy } from '@slsplus/serverless-http';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Serverless Express');
});

const proxy = new ServerlessProxy({
  requestListenser: app,
});

// mock event
const event = {
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

proxy.getResponse(event).then((res) => {
  console.log(res);
});
```

## License

MIT License

Copyright (c) 2020 Serverless Plus
