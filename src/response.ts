import isType from 'type-is';
import { HttpResponse, ApigwResponse } from './typings';

export function isBinaryContentType(binaryTypes: string[], contentType: string) {
  return binaryTypes.length > 0 && !!isType.is(contentType, binaryTypes);
}

export function responseToApigw({
  response,
  isBase64Encoded = false,
  binaryTypes = [],
}: {
  response: HttpResponse;
  isBase64Encoded?: boolean;
  binaryTypes?: string[];
}): ApigwResponse {
  const { statusCode, headers, body } = response;

  Object.keys(headers).map((key) => {
    const v = headers[key];
    if (Array.isArray(v)) {
      if (key.toLowerCase() !== 'set-cookie') {
        headers[key] = v.join(',');
      }
    }
  });

  const contentType =
    headers['content-type'] ?? (headers['Content-Type'] as string) ?? 'application/json';
  const isBinaryBody = isBinaryContentType(binaryTypes, contentType);

  const resBody =
    body instanceof Buffer ? body.toString(isBinaryBody ? 'base64' : 'utf8') : (body as string);

  return {
    headers,
    statusCode: statusCode,
    body: resBody,
    isBase64Encoded: isBase64Encoded || isBinaryBody,
  };
}
