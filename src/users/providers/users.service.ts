import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';
import { Exclude } from 'class-transformer';

export class User {
  id!: number;
  name!: string;
  email!: string;

  @Exclude()
  password!: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

@Injectable()
export class UserService {
  private users: User[] = [];
  private nextId: number = 1;

  create(dto: CreateUserDto): User {
    const user = new User({ id: this.nextId++, ...dto });
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
