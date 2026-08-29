import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ada@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'supersecret1' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
