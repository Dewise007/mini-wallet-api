import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ada@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'supersecret1' })
  @IsString()
  @MinLength(8)
  password!: string;
}
