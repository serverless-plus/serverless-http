import { Server } from 'http';
import { request, eventToRequest } from './request';
import { responseToApigw } from './response';
import { ApigwEvent, RequestOptions } from './typings';

interface ProxyOptions {
  host?: string;
  port?: number;
  framework?: string;
  binaryTypes?: string[];
  server?: Server;
}

export class ServerlessProxy {
  options: ProxyOptions;
  socket = '';

  constructor(options?: ProxyOptions) {
    this.options = options || {};
    this.options.host = this.options.host ?? 'localhost';
    this.options.port = this.options.port ?? 9000;

    // if sepecify server try to start listen uds
    if (this.options.server) {
      this.options.server.on('error', (error: Error & { code: string }) => {
        // UDS mode，retry when listen port is in use
        if (error.code === 'EADDRINUSE' && this.socket) {
          this.start();
        } else {
          console.log(error);
        }
      });

      this.start();
    }
  }

  async start() {
    const socket = `/tmp/slsplus-${Math.random()
      .toString(36)
      .slice(2)}.sock`;
    this.socket = socket;
    this.options.server?.listen(socket, () => {
      console.log(`Server start on ${socket}`);
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
}