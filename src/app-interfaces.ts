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

  // Informational responses (100 – 199)
  continue: (data?: any) => HttpRes;
  switchingProtocols: (data?: any) => HttpRes;
  processing: (data?: any) => HttpRes;
  earlyHints: (data?: any) => HttpRes;

  // Successful responses (200 – 299)
  ok: (data?: any) => HttpRes;
  created: (data?: any) => HttpRes;
  accepted: (data?: any) => HttpRes;
  nonAuthoritativeInformation: (data?: any) => HttpRes;
  noContent: () => HttpRes;
  resetContent: () => HttpRes;
  partialContent: (data?: any) => HttpRes;

  // Redirection messages (300 – 399)
  multipleChoices: (data?: any) => HttpRes;
  movedPermanently: (data?: any) => HttpRes;
  found: (data?: any) => HttpRes;
  seeOther: (data?: any) => HttpRes;
  notModified: () => HttpRes;
  temporaryRedirect: (data?: any) => HttpRes;
  permanentRedirect: (data?: any) => HttpRes;

  // Client error responses (400 – 499)
  badRequest: (data?: any) => HttpRes;
  unauthorized: (data?: any) => HttpRes;
  paymentRequired: (data?: any) => HttpRes;
  forbidden: (data?: any) => HttpRes;
  notFound: (data?: any) => HttpRes;
  methodNotAllowed: (data?: any) => HttpRes;
  notAcceptable: (data?: any) => HttpRes;
  requestTimeout: (data?: any) => HttpRes;
  conflict: (data?: any) => HttpRes;
  gone: (data?: any) => HttpRes;
  unprocessableEntity: (data?: any) => HttpRes;
  tooManyRequests: (data?: any) => HttpRes;

  // Server error responses (500 – 599)
  internalServerError: (data?: any) => HttpRes;
  notImplemented: (data?: any) => HttpRes;
  badGateway: (data?: any) => HttpRes;
  serviceUnavailable: (data?: any) => HttpRes;
  gatewayTimeout: (data?: any) => HttpRes;
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

export type UseClass<T = any> = new (...args: any[]) => any;

export type ModuleProvider = UseClass | { key: string; useClass: UseClass };
export interface ModuleOptions {
  path?: string;
  providers?: ModuleProvider[];
  imports?: (AppModule | UseClass<AppModule>)[];
}
