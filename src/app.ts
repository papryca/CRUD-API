import dotenv from 'dotenv';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { Router } from './router';
import { UserController } from './userController';
import { UserStorage } from './storage';

dotenv.config();
const PORT: number = Number.parseInt(process.env.PORT) || 3000;
const DB_HOST: string = process.env.DB_HOST || 'localhost';

const userStorage = new UserStorage();
const userController = new UserController(userStorage);

const router = new Router();
router.register({
  path: new RegExp('^/?api/users/?$', 'i'),
  method: 'GET',
  handler: (req, res, args) => {
    return userController.list(req, res, args);
  },
});
router.register({
  path: new RegExp('^/?api/users/([^/]+)/?$', 'i'),
  method: 'GET',
  handler: (req, res, args) => {
    return userController.get(req, res, args);
  },
});
router.register({
  path: new RegExp('^/?api/users/?$', 'i'),
  method: 'POST',
  handler: (req, res, args) => {
    return userController.create(req, res, args);
  },
});
router.register({
  path: new RegExp('^/?api/users/([^/]+)/?$', 'i'),
  method: 'PUT',
  handler: (req, res, args) => {
    return userController.update(req, res, args);
  },
});
router.register({
  path: new RegExp('^/?api/users/([^/]+)/?$', 'i'),
  method: 'DELETE',
  handler: (req, res, args) => {
    return userController.delete(req, res, args);
  },
});

export const requestsHandler = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  try {
    const routeHit = router.match(req);

    if (routeHit !== null) {
      await routeHit.route.handler(req, res, routeHit.args);
      return;
    }
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not Found' }));
  return;
};

const server = createServer(requestsHandler);

createServer(() => {});

server.listen(PORT, DB_HOST, () => {
  console.log(
    `Server is running on port ${PORT} and connected to DB at ${DB_HOST}`
  );
});
