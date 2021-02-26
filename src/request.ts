import http from 'http';
import { format as UrlFormat, parse as UrlParse } from 'url';
import { ApigwEvent, HttpRequest, HttpResponse, RequestOptions } from './typings';

/**
 * Get remote ip
 * @param event apigw event
 */
function getRemoteIP(event: ApigwEvent) {
  if (event.requestContext) {
    return event.requestContext.sourceIp || '';
  }
  return '';
}

/**
 * Get body
 * @param event apigw event
 */
function getEventBody(event: ApigwEvent) {
  return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
}

/**
 * Get path formatted with query
 * @param event apigw event
 */
function getPathWithQueryString(event: ApigwEvent) {
  return UrlFormat({ pathname: event.path, query: event.queryString });
}

/**
 * Convert apigw event to HTTP request
 * @param event apigw event
 */
export function eventToRequest(event: ApigwEvent): HttpRequest {
  const headers = Object.assign({}, event.headers);

  const ip = getRemoteIP(event);
  if (ip) {
    headers['X-Forwarded-For'] = ip;
  }

  let body = Buffer.concat([]);
  if (event.body) {
    body = getEventBody(event);
    if (!headers['Content-Length']) {
      headers['Content-Length'] = `${Buffer.byteLength(body)}`;
    }
  }

  return {
    method: event.httpMethod,
    path: getPathWithQueryString(event),
    headers,
    body,
  };
}

/**
 * HTTP request
 * @param options request options
 * @param body request body
 */
export async function request(options: RequestOptions, body?: any): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (response) => {
      const buffer: any[] = [];

      response.on('data', (chunk) => {
        buffer.push(chunk);
      });

      response.on('end', () => {
        resolve({
          statusCode: response.statusCode || 200,
          headers: response.headers,
          body: Buffer.concat(buffer),
        });
      });
    });

    req.on('error', (error) => {
      console.log('[Request Error] ', error);
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

/**
 * Post request
 * @param url post url
 * @param body
 */
export async function post(url: string, body?: any) {
  const parsedUrl = UrlParse(url);
  const options: RequestOptions = {
    protocol: parsedUrl.protocol || 'http:',
    host: parsedUrl.hostname || 'localhost',
    port: parsedUrl.port || 9000,
    path: parsedUrl.path || '/',
  };
  options.method = 'POST';
  return request(options, body);
}

/**
 * Get request
 * @param url get url
 */
export async function get(url: string) {
  const parsedUrl = UrlParse(url);
  const options: RequestOptions = {
    protocol: parsedUrl.protocol || 'http:',
    host: parsedUrl.hostname || 'localhost',
    port: parsedUrl.port || 9000,
    path: parsedUrl.path || '/',
  };
  options.method = 'GET';
  return request(options);
}
