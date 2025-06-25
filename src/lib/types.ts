export type HttpRequest<T = unknown> = T & {
  body: T;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: {
    Accept?: string;
    'Accept-Encoding'?: string;
    'Accept-Language'?: string;
    'Cache-Control'?: string;
    'Content-Type'?: string;
    'Content-Length'?: string;
    'User-Agent'?: string;
    'X-Forwarded-For'?: string;
    'X-Forwarded-Host'?: string;
    'X-Forwarded-Proto'?: string;
    'X-Forwarded-Server'?: string;
    'X-Real-IP'?: string;
    'X-Request-ID'?: string;
    'X-Request-Start'?: string;
    'X-Response-Time'?: string;
    'X-Runtime'?: string;
    'X-UA-Compatible'?: string;
    'X-Vercel-IP-City'?: string;
    'X-Vercel-IP-Country'?: string;
    'X-Vercel-IP-Latitude'?: string;
    Authorization?: string;
    Cookie?: string;
    Host?: string;
    Origin?: string;
    Referer?: string;
    [key: string]: string | undefined;
  };
  cookies: { [key: string]: string | undefined };
  ip: string;
  method: string;
  path: string;
  url: string;
  [key: string]: any;
};

export type HttpResponse<T = unknown> = T & {
  status: (code: number) => HttpResponse<T>;
  headers: (headers: { [key: string]: string | undefined }) => HttpResponse<T>;
  send: (body: any) => HttpResponse<T>;
  json: (body: any) => HttpResponse;
  [key: string]: any;
};

export type HttpNext<T = (err?: any) => void> = T;

export type HttpError<T = unknown> = T & {
  status?: number;
  message?: string;
  [key: string]: any;
};

export interface HttpContext<Req = HttpRequest, Res = HttpResponse, Next = HttpNext, Err = any> {
  req: HttpRequest<Req>;
  res: HttpResponse<Res>;
  next: HttpNext<Next>;
  err?: HttpError<Err>;
}
