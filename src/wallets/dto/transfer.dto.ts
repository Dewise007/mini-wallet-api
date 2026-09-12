import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsEmail } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    example: 'recipient@example.com',
    description: 'Email of the user receiving the transfer',
  })
  @IsEmail()
  toEmail!: string;

  @ApiProperty({
    example: 1500,
    description: 'Amount in minor units (e.g. kobo, cents)',
  })
  @IsInt()
  @IsPositive()
  amountMinor!: number;
}
