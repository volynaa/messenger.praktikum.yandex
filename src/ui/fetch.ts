const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

type HTTPMethod = (typeof METHODS)[keyof typeof METHODS];

interface RequestOptions {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  data?: Record<string, unknown> | FormData | XMLHttpRequestBodyInit;
  timeout?: number;
  tries?: number;
}
type QueryParams = Record<string, string | number | boolean>;
function queryStringify(data: QueryParams): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be object');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    return '';
  }

  return keys.reduce((result, key, index) => {
    const value = data[key];
    const encodedValue = encodeURIComponent(String(value));
    return `${result}${key}=${encodedValue}${index < keys.length - 1 ? '&' : ''}`;
  }, '?');
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class HTTPTransport {
  private createMethod(method: HTTPMethod) {
    return <R = unknown>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<R> => {
      return this.request<R>(url, { ...options, method });
    };
  }
  public readonly get = this.createMethod(METHODS.GET);

  public readonly put = this.createMethod(METHODS.PUT);

  public readonly post = this.createMethod(METHODS.POST);

  public readonly delete = this.createMethod(METHODS.DELETE);
  private request<R>(
      url: string,
      options: RequestOptions & { method: HTTPMethod },
  ): Promise<R>  {
    const { headers = {}, method, data, timeout = 5000 } = options;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject(new Error('No method'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;

      xhr.open(
          method,
          isGet && data && typeof data === 'object' && !(data instanceof FormData)
              ? `${url}${queryStringify(data as QueryParams)}`
              : url,
      );

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = function () {
        resolve(xhr);
      };

      xhr.onabort = () => reject(new Error('Request aborted'));
      xhr.onerror = () => reject(new Error('Request failed'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));

      xhr.timeout = timeout;

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === 'object') {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(data);
      }
    });
  }
}
async function fetchWithRetry(url: string, options: RequestOptions & { tries?: number } = {}): Promise<Response> {
  const { tries = 1, ...fetchOptions } = options;

  const onError = (err: Error): Promise<Response> => {
    const triesLeft = tries - 1;
    if (triesLeft <= 0) {
      throw err;
    }

    return fetchWithRetry(url, { ...fetchOptions, tries: triesLeft });
  };

  try {
    return await fetch(url, fetchOptions as RequestInit);
  } catch (err) {
    return onError(err as Error);
  }
}
