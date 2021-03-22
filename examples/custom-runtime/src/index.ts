import { ServerlessProxy, TencentRuntime } from '@slsplus/serverless-http';
import app from './app';


const proxy = new ServerlessProxy({
  requestListener: app,
});
const runtime = new TencentRuntime({
  proxy,
});

runtime.startLoop();
