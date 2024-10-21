import { v4 as uuidv4 } from 'uuid';

export interface User {
  id?: string;
  username: string;
  age: number;
  hobbies: string[];
}
export class UserStorage {
  users: User[] = [];

  getAll(): User[] {
    return this.users;
  }
  getById(id: string): User | null {
    const user = this.users.find((user: User) => user.id === id);
    if (user === undefined) {
      return null;
    }
    return user;
  }

  create(data: User): User {
    const user = { id: uuidv4(), ...data };
    this.users.push(user);
    return user;
  }

  update(id: string, data: User): User {
    this.users = this.users.map((user) => {
      if (user.id === id) {
        if (data.username) user.username = data.username;
        if (data.age) user.age = data.age;
        if (data.hobbies) user.hobbies = data.hobbies;
      }
      return user;
    });

    return this.getById(id);
  }

  deleteById(id: string) {
    this.users = this.users.filter((user: User) => user.id !== id);
  }
}
