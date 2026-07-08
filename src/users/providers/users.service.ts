import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  findAll() {
    throw new Error('Method not implemented.');
  }
  private users: User[] = [];
  private nextId: number = 1;

  create(name: string, email: string): User {
    const user: User = {
      id: this.nextId++,
      name: name,
      email: email,
    };
    this.users.push(user);
    return user;
  }
  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
