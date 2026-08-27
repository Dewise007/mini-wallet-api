import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './providers/auth.service';
import { UserService } from '../users/providers/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: { userId: number; email: string }) {
    return user;
  }
}
