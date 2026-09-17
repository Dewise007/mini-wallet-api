import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './providers/wallets.service';
import { MoneyMovedListener } from './listeners/money-moved.listener';
import { WalletSummaryTask } from './tasks/wallet-summary.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction, User]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, MoneyMovedListener, WalletSummaryTask],
  exports: [TypeOrmModule, WalletsService],
})
export class WalletsModule {}
