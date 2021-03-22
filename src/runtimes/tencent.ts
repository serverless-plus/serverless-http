import { ServerlessProxy, request } from '../';
import net from 'net';
import { AnyObject, RequestOptions } from '../typings';

const RUNTIME_API = process.env.SCF_RUNTIME_API || 'localhost';
const RUNTIME_API_PORT = Number(process.env.SCF_RUNTIME_API_PORT) || 9001;
const APIS = {
  ready: '/runtime/init/ready',
  event: '/runtime/invocation/next',
  response: '/runtime/invocation/response',
  error: '/runtime/invocation/error',
};

export interface TencentRuntimeOptions {
  debug?: boolean;
  proxy: ServerlessProxy;
}

// custom runtime proxy for tencent cloud
export class TencentRuntime {
  // debug mode
  debug: boolean;

  // serverless proxy
  proxy: ServerlessProxy;

  // custom runtime api request options
  requestOptions: {
    host: string;
    port: number;
  };

  constructor(options?: TencentRuntimeOptions) {
    this.requestOptions = {
      host: RUNTIME_API,
      port: RUNTIME_API_PORT,
    };

    options = options || ({} as TencentRuntimeOptions);

    this.debug = options.debug ?? false;

    this.proxy = options.proxy;
  }

  /**
   * start loop to handler event
   */
  async startLoop() {
    // start http server
    await this.proxy.start();

    // post ready -- finish initialization
    await this.ready();
    console.log(`Initialize success`);

    try {
      while (true) {
        await this.run();
      }
    } catch (e) {
      await this.error({
        statusCode: 501,
        body: `Code Error: ${e}`,
        headers: {},
        isBase64Encoded: false,
      });
    }
  }

  /**
   * Run apigw event trigger flow
   */
  async run() {
    const event = await this.event();

    if (this.debug) {
      console.log(`Event: ${JSON.stringify(event)}`);
    }

    if (!event) {
      return await this.error({
        statusCode: 500,
        body: 'Error event',
        headers: {
          'content-type': 'application/json',
        },
        isBase64Encoded: false,
      });
    }
    const res = await this.proxy.getResponse(event);
    return await this.response(res);
  }

  /**
   * Whether port is in use
   * @param {number} port listen port
   */
  isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer().listen(port);
      server.on('listening', () => {
        server.close();
        resolve(false);
      });
      server.on('error', (err: Error & { code: string }) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * http request
   * @param {RequestOptions} options reqeust options
   * @param {any} body post body
   */
  async request(options: RequestOptions, body?: any) {
    const res = await request(
      {
        ...this.requestOptions,
        ...options,
      },
      body,
    );

    return res.body.toString('utf8') || '';
  }

  /**
   * post ready request
   */
  async ready() {
    return this.request({
      path: APIS.ready,
      method: 'POST',
    });
  }

  /**
   * get apigw event
   */
  async event() {
    try {
      const e = await this.request({
        path: APIS.event,
        method: 'GET',
      });
      return JSON.parse(e);
    } catch (e) {
      return null;
    }
  }

  /**
   * post invoke response to runtime api
   * @param {object} data post response data
   */
  async response(data: AnyObject) {
    return this.request(
      {
        path: APIS.response,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      },
      JSON.stringify(data),
    );
  }

  /**
   * post error message to runtime api
   * @param {object} error error object
   */
  async error(error: AnyObject) {
    return this.request(
      {
        path: APIS.error,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      },
      JSON.stringify(error),
    );
  }
}
