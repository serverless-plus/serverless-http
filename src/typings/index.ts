import { IncomingHttpHeaders } from 'http';

export interface AnyObject {
  [prodName: string]: any;
}

export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'head'
  | 'delete'
  | 'options'
  | 'trace'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'DELETE'
  | 'OPTIONS'
  | 'TRACE';

export interface ApigwRequestContext {
  serviceId: string;
  path: string;
  httpMethod: string;
  requestId: string;
  identity: { [prodName: string]: any };
  sourceIp: string;
  stage: string;
}

export interface ApigwEvent {
  httpMethod: HttpMethod;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
  path: string;
  queryString: Record<string, string>;
  requestContext: ApigwRequestContext;
  pathParameters: Record<string, string>;
  queryStringParameters: Record<string, string>;
  headerParameters: Record<string, string>;
  stageVariables: {
    stage: string;
  };
}

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  body?: Buffer;
  headers: Record<string, string>;
  host?: string;
  port?: number;
  socket?: string;
}

export interface ApigwResponse {
  body: string;
  statusCode: number;
  headers: IncomingHttpHeaders;
  isBase64Encoded: boolean;
}

export interface RequestOptions {
  protocol?: string;
  method?: string;
  host?: string;
  port?: string | number;
  path?: string;
  headers?: Record<string, string>;
  socketPath?: string;
}

export interface HttpResponse {
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: Buffer;
}
