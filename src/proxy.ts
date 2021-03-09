import { spawn, ChildProcess } from 'child_process';
import net from 'net';
import http, { Server, RequestListener } from 'http';
import { request, eventToRequest } from './request';
import { responseToApigw } from './response';
import { sleep } from './utils';
import { ApigwEvent, RequestOptions } from './typings';

interface ProxyOptions {
  host?: string;
  port?: number;
  framework?: string;
  binaryTypes?: string[];
  requestListenser?: RequestListener;
  startCmd?: string;
  useChildProcess?: boolean;
}

export class ServerlessProxy {
  options: ProxyOptions;
  socket = '';
  server: Server | null;
  childProcess: ChildProcess | null;
  initalized = false;

  constructor(options?: ProxyOptions) {
    this.options = options || {};
    this.options.host = this.options.host ?? 'localhost';
    this.options.port = this.options.port ?? 9000;
    this.options.useChildProcess = this.options.useChildProcess ?? false;

    this.server = null;
    this.childProcess = null;
  }

  async start(): Promise<Server | ChildProcess> {
    // already initialized, just return
    if (this.initalized) {
      if (this.options.useChildProcess) {
        return this.childProcess || this.startByChildProcess();
      }
      return this.server || this.startByUDS();
    }

    if (this.options.useChildProcess) {
      return this.startByChildProcess();
    }
    return this.startByUDS();
  }

  async startByUDS(): Promise<Server> {
    return new Promise(async (resolve, reject) => {
      const socket = `/tmp/slsplus-${Math.random()
        .toString(36)
        .slice(2)}.sock`;
      this.socket = socket;

      this.server = http.createServer(this.options.requestListenser);
      this.server.on('error', (error: Error & { code: string }) => {
        // UDS mode，retry when listen port is in use
        if (error.code === 'EADDRINUSE' && this.socket) {
          this.start();
        } else {
          console.log(error);
          reject(error);
        }
      });
      this.server?.listen(socket, () => {
        console.log(`Server start on ${socket}`);
      });

      await this.isServerReady(true);

      resolve(this.server);
    });
  }

  /**
   * start http server
   */
  async startByChildProcess(): Promise<ChildProcess> {
    return new Promise(async (resolve, reject) => {
      if (!this.options.startCmd) {
        reject(new Error('Missing start command'));
        return;
      }
      if (this.initalized && this.childProcess) {
        resolve(this.childProcess);
        return;
      }
      console.log('Starting serverless server');
      const [cmd, ...args] = this.options.startCmd.split(' ');
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

  async getResponse(event: ApigwEvent) {
    try {
      const req = eventToRequest(event);

      const requestOpts: RequestOptions = {
        method: req.method,
        host: this.options.host,
        port: this.options.port,
        path: req.path,
        headers: req.headers,
      };
      if (this.socket) {
        requestOpts.socketPath = this.socket;
      }
      const response = await request(requestOpts, req.body);

      return responseToApigw({
        response,
        isBase64Encoded: event.isBase64Encoded,
        binaryTypes: this.options.binaryTypes,
      });
    } catch (e) {
      console.log('[Code Error] ', e);
      return {
        isBase64Encoded: false,
        statusCode: 502,
        body: '',
        headers: {},
      };
    }
  }

  /**
   * Whether port is in use
   * @param {number | string} portOrSocket listen port or socket path
   */
  isPortInUse(portOrSocket: number | string): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer().listen(portOrSocket);
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
  async isServerReady(isUDS = false) {
    let ready = false;
    while (!ready) {
      ready = await this.isPortInUse(isUDS ? this.socket : (this.options.port as number));
      await sleep(100);
      if (ready) {
        this.initalized = true;
        return true;
      }
    }
  }
}
