import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

interface MoneyMovedJobData {
  userId: number;
  type: 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';
  amountMinor: number;
}

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  @Process('money-moved')
  async handleMoneyMoved(job: Job<MoneyMovedJobData>) {
    const { userId, type, amountMinor } = job.data;

    this.logger.log(
      `Notification: user ${userId} had a ${type} of ${amountMinor} minor units`,
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    return { notified: true };
  }
}
