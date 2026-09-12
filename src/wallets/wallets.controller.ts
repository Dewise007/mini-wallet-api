import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WalletsService } from './providers/wallets.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.walletsService.getMe(user.userId);
  }

  @Post('deposit')
  @UseInterceptors(IdempotencyInterceptor)
  deposit(@CurrentUser() user: AuthenticatedUser, @Body() dto: DepositDto) {
    return this.walletsService.deposit(user.userId, dto.amountMinor);
  }

  @Post('withdraw')
  @UseInterceptors(IdempotencyInterceptor)
  withdraw(@CurrentUser() user: AuthenticatedUser, @Body() dto: WithdrawDto) {
    return this.walletsService.withdraw(user.userId, dto.amountMinor);
  }

  @Post('transfer')
  @UseInterceptors(IdempotencyInterceptor)
  transfer(@CurrentUser() user: AuthenticatedUser, @Body() dto: TransferDto) {
    return this.walletsService.transfer(
      user.userId,
      dto.toEmail,
      dto.amountMinor,
    );
  }
}
