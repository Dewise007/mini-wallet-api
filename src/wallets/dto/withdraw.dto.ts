import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({
    example: 2000,
    description: 'Amount in minor units (e.g. kobo, cents)',
  })
  @IsInt()
  @IsPositive()
  amountMinor!: number;
}
