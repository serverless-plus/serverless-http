import { ServerlessProxy, TencentRuntime } from '@slsplus/serverless-http';
import app from './app';

async function start() {
  const proxy = new ServerlessProxy({
    requestListener: app,
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
