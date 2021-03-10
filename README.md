# Serverless HTTP Proxy

[![npm](https://img.shields.io/npm/v/@slsplus/serverless-http)](http://www.npmtrends.com/@slsplus/serverless-http)
[![NPM downloads](http://img.shields.io/npm/dm/@slsplus/serverless-http.svg?style=flat-square)](http://www.npmtrends.com/@slsplus/serverless-http)
[![Status](https://github.com/serverless-plus/serverless-http/workflows/Test/badge.svg?branch=master)](https://github.com/serverless-plus/serverless-http/actions?query=workflow:Test+branch:master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Serverless HTTP Proxy.

## Installation

```bash
$ npm i @slsplus/serverless-http --save
```

## Usage

### Start proxy by UDS(UNIX Domain Socket)

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

// export serverless handler function
export.handler = async (event, context) => {
  await proxy.start()
  const res = await proxy.getResponse(event);
  return res;
}
```

Here is the example [nodejs-runtime](./examples/nodejs-runtime).

### Start proxy by child process

Start proxy server by child proces, set `useChildProcess` to `true`, like below:

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
  useChildProcess: true,
});

// export serverless handler function
export.handler = async (event, context) => {
  await proxy.start()
  const res = await proxy.getResponse(event);
  return res;
}
```

### Using with Custom Runtime for Tencent Cloud SCF

```js
import { ServerlessProxy, TencentRuntime } from '@slsplus/serverless-http';
import app from './app';

async function start() {
  const proxy = new ServerlessProxy({
    requestListenser: app,
  });
  const runtime = new TencentRuntime({
    proxy,
  });

  // start http server
  await proxy.start();

  // post ready -- finish initialization
  await runtime.ready();
  console.log(`Initialize success`);

  try {
    while (true) {
      await runtime.run();
    }
  } catch (e) {
    await runtime.error({
      statusCode: 501,
      body: `Code Error: ${e}`,
      headers: {},
      isBase64Encoded: false,
    });
  }
}

start();
```

Here is the example [custom-runtime](./examples/custom-runtime).

More information about [Tencent Cloud Custom Runtime](https://cloud.tencent.com/document/product/583/47274).

## License

MIT License

Copyright (c) 2020 Serverless Plus
