export function HttpPost(path: string = '/') {
  return (target: new (...args: any[]) => any, propertyKey: string) => {
    target.prototype.httpPost = { __path: path };
  };
}

export function HttpGet(path: string = '/') {
  return (target: new (...args: any[]) => any, propertyKey: string) => {
    target.prototype.httpGet = { __path: path };
  };
}
