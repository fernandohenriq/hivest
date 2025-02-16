import { AppModule } from './app-module';

export type HttpMethods = 'post' | 'get' | 'patch' | 'put' | 'delete';

export interface HttpReq {
  body: any;
  headers: {
    ['content-type']: string;
    ['accept']: string;
    ['authorization']: string;
    [key: string]: string;
  };
  params: any;
  query: any;
  method: string;
  url: string;
  originalUrl: string;
  baseUrl: string;
  path: string;
  protocol: string;
  secure: boolean;
  subdomains: string[];
  ip: string;
  ips: string[];
  hostname: string;
  [key: string]: any;
}

export interface HttpRes {
  status: (status: number) => HttpRes;
  json: (body: any) => HttpRes;
}

export type HttpErr = any;
export type HttpNext = (err?: any) => void;

export type HttpContext = {
  req: HttpReq;
  res: HttpRes;
  next: HttpNext;
  err?: HttpErr;
};

export type HttpHandler = (ctx: HttpContext) => any;
export type HttpMiddlewareOptions = { errorHandler?: boolean };

export interface ModuleOptions {
  path?: string;
  providers?: { key?: string; useClass: any }[];
  imports?: AppModule[];
}

export interface ClassProvider<T> {
  provide: string | Function;
  useClass: new (...args: any[]) => T;
}
