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

export class HTTPTransport {
  private readonly pathBase: string = '';
  constructor(url: string) {
    this.pathBase = url
  }
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
      const fullUrl = this.pathBase.length ? this.pathBase + url : url;
      xhr.open(
          method,
          isGet && data && typeof data === 'object' && !(data instanceof FormData)
              ? `${fullUrl}${queryStringify(data as QueryParams)}`
              : fullUrl,
      );

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = function () {
        resolve(xhr as R);
      };
      xhr.onabort = () => reject(new Error('Request aborted'));
      xhr.onerror = () => reject(new Error('Request failed'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));
      xhr.timeout = timeout;
      xhr.withCredentials = true;

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
