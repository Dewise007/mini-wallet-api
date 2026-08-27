import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ada@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'supersecret1' })
  @IsString()
  @MinLength(8)
  password!: string;
}
