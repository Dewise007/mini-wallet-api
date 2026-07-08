import { Controller } from '@nestjs/common';
import { UserService } from './providers/users.service';
import { Body } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}
  //the answere to tht question on friday
  //"I declare what I need in the constructor. Nest looks at the providers registered in the module, builds the instance once, and injects it — I never construct it myself."
  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.usersService.create(body.name, body.email);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }
}
