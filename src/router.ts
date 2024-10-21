import { ServerResponse, IncomingMessage } from 'node:http';

interface Route {
  path: RegExp;
  method: string;
  handler: (
    req: IncomingMessage,
    resp: ServerResponse,
    args: string[]
  ) => Promise<void>;
}

interface RouteHit {
  route: Route;
  args: string[];
}

export class Router {
  routes: Route[] = [];

  register(route: Route) {
    this.routes.push(route);
  }

  match(req: IncomingMessage): RouteHit | null {
    if (req.url == null) {
      return null;
    }

    const url = req.url.split('?').shift();
    for (let route of this.routes) {
      const arr = url.match(route.path);
      if (arr != null && route.method === req.method) {
        arr.shift();
        return {
          route: route,
          args: arr,
        };
      }
    }

    return null;
  }
}
