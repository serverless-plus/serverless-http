import { ServerlessProxy, request } from '../';
import { sleep } from '../utils';
import { spawn, ChildProcess } from 'child_process';
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

export class TencentRuntime {
  debug: boolean;
  initalized: boolean;
  startCmd: string;
  port: number;
  proxy: ServerlessProxy;
  childProcess: ChildProcess | null;
  requestOptions: {
    host: string;
    port: number;
  };

  constructor(debug = false) {
    this.requestOptions = {
      host: RUNTIME_API,
      port: RUNTIME_API_PORT,
    };

    this.debug = debug;
    this.initalized = false;
    this.startCmd = process.env.SLS_START_CMD ?? 'node app.js';
    this.port = Number(process.env.SLS_SERVER_PORT) || 9000;

    this.proxy = new ServerlessProxy({
      host: 'localhost',
      port: this.port,
    });

    this.childProcess = null;
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
   * Whether http server is ready
   */
  async isServerReady() {
    let ready = false;
    while (!ready) {
      ready = await this.isPortInUse(this.port);
      await sleep(100);
      if (ready) {
        this.initalized = true;
        return true;
      }
    }
  }

  /**
   * start http server
   */
  startServer(): Promise<ChildProcess> {
    return new Promise(async (resolve, reject) => {
      if (!this.startCmd) {
        reject(new Error('Missing start command'));
        return;
      }
      if (this.initalized && this.childProcess) {
        resolve(this.childProcess);
        return;
      }
      console.log('Starting serverless server');
      const [cmd, ...args] = this.startCmd.split(' ');
      const cpr = spawn(cmd, args, {
        cwd: process.cwd(),
      });

      cpr.stdout.pipe(process.stdout);
      cpr.stderr.pipe(process.stderr);

      cpr.on('error', (err) => {
        console.log(`Child process error: ${err}`);

        this.initalized = false;
        reject(err);
      });

      cpr.on('exit', (code, signal) => {
        const msg = `Child process exist with code: ${code}, signal: ${signal}`;
        this.initalized = false;
        reject(new Error(msg));
      });

      // await sleep(1000);
      await this.isServerReady();
      this.childProcess = cpr;
      resolve(cpr);
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
