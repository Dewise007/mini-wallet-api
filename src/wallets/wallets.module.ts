import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './providers/wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, User])],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [TypeOrmModule, WalletsService],
})
export class WalletsModule {}
