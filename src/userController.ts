import { IncomingMessage, ServerResponse } from 'node:http';
import { UserStorage, User } from './storage';
import { validate as validUuid } from 'uuid';

export class UserController {
  private userStorage: UserStorage;

  constructor(userStorage: UserStorage) {
    this.userStorage = userStorage;
  }

  async list(req: IncomingMessage, resp: ServerResponse, args: string[]) {
    return this.writeResponse(resp, 200, this.userStorage.getAll());
  }

  async get(req: IncomingMessage, resp: ServerResponse, args: string[]) {
    if (!validUuid(args[0])) {
      return this.writeResponse(resp, 400, { message: 'Invalid UUID' });
    }

    const user = this.userStorage.getById(args[0]);
    if (user === null) {
      return this.writeResponse(resp, 404, { message: 'Not Found' });
    } else {
      return this.writeResponse(resp, 200, user);
    }
  }

  async create(req: IncomingMessage, resp: ServerResponse, args: string[]) {
    try {
      const body = await this.extractData(req);
      const data = JSON.parse(body);

      if (this.valid(data)) {
        const user = this.userStorage.create(data);
        return this.writeResponse(resp, 200, user);
      }
    } catch (e) {
      return this.writeResponse(resp, 400, { message: 'Bad Request' });
    }
    return this.writeResponse(resp, 400, { message: 'Bad Request' });
  }

  async update(req: IncomingMessage, resp: ServerResponse, args: string[]) {
    if (!validUuid(args[0])) {
      return this.writeResponse(resp, 400, { message: 'Invalid UUID' });
    }

    const user = this.userStorage.getById(args[0]);
    if (user === null) {
      return this.writeResponse(resp, 404, { message: 'Not Found' });
    } else {
      try {
        const body = await this.extractData(req);
        const data = JSON.parse(body);

        if (this.valid(data)) {
          const user = this.userStorage.update(args[0], data);
          return this.writeResponse(resp, 200, user);
        }
      } catch (e) {
        return this.writeResponse(resp, 400, { message: 'Bad Request' });
      }
    }
  }

  async delete(req: IncomingMessage, resp: ServerResponse, args: string[]) {
    if (!validUuid(args[0])) {
      return this.writeResponse(resp, 400, { message: 'Invalid UUID' });
    }

    const user = this.userStorage.getById(args[0]);
    if (user === null) {
      return this.writeResponse(resp, 404, { message: 'Not Found' });
    } else {
      this.userStorage.deleteById(user.id);
      return this.writeResponse(resp, 200, { message: 'Deleted', id: user.id });
    }
  }

  async extractData(req: IncomingMessage) {
    const res = await new Promise((resolve, reject) => {
      try {
        let body = '';
        req.on('data', (chunk) => {
          body = chunk.toString();
        });

        req.on('end', () => {
          resolve(body);
        });
      } catch (error) {
        reject(error);
      }
    });

    return res as string;
  }

  writeResponse(resp: ServerResponse, code: number, data: any) {
    resp.writeHead(code, { 'Content-Type': 'application/json' });
    resp.end(JSON.stringify(data));
  }

  valid({ username, age, hobbies }: User): boolean {
    const isStringArray = (arr: Array<string>) =>
      arr.every((el) => typeof el === 'string');

    const isValidUsername =
      !!username && !!username.length && typeof username === 'string';
    const isValidAge = !!age && Number.isInteger(age);
    const isHobbies =
      !!hobbies && !!Array.isArray(hobbies) && isStringArray(hobbies);

    return isValidUsername && isValidAge && isHobbies;
  }
}
