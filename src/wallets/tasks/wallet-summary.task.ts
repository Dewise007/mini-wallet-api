import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class WalletSummaryTask {
  private readonly logger = new Logger(WalletSummaryTask.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logDailySummary() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const transactions = await this.transactionsRepository
      .createQueryBuilder('t')
      .where('t.createdAt >= :since', { since })
      .getMany();

    const count = transactions.length;
    const totalMinor = transactions.reduce(
      (sum, t) => sum + BigInt(t.amountMinor),
      BigInt(0),
    );

    this.logger.log(
      `Daily summary: ${count} transactions in the last 24h, totaling ${totalMinor.toString()} minor units`,
    );
  }
}
