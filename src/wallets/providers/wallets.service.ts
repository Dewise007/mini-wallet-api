import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { DistributedLockService } from '../../redis/distributed-lock.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly lockService: DistributedLockService,
  ) {}

  async getWalletByUserId(userId: number): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getMe(userId: number) {
    const wallet = await this.getWalletByUserId(userId);

    const transactions = await this.transactionsRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      balanceMinor: wallet.balanceMinor,
      transactions,
    };
  }

  async deposit(userId: number, amountMinor: number) {
    return this.dataSource.transaction(async (manager) => {
      // Look up the wallet id first (no lock needed yet), then lock by id directly
      const walletRef = await manager.getRepository(Wallet).findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!walletRef) {
        throw new NotFoundException('Wallet not found');
      }

      const wallet = await manager.getRepository(Wallet).findOne({
        where: { id: walletRef.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const balanceBefore = BigInt(wallet.balanceMinor);
      const balanceAfter = balanceBefore + BigInt(amountMinor);

      wallet.balanceMinor = balanceAfter.toString();
      await manager.getRepository(Wallet).save(wallet);

      await manager.getRepository(Transaction).save(
        manager.getRepository(Transaction).create({
          walletId: wallet.id,
          type: 'deposit',
          amountMinor: amountMinor.toString(),
          balanceBeforeMinor: balanceBefore.toString(),
          balanceAfterMinor: balanceAfter.toString(),
          reference: randomUUID(),
        }),
      );

      return { balanceMinor: wallet.balanceMinor };
    });
  }

  async withdraw(userId: number, amountMinor: number) {
    const lockKey = `wallet:${userId}`;
    const token = await this.lockService.acquire(lockKey, 5000);

    if (!token) {
      throw new BadRequestException('Wallet is busy. Please try again.');
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const walletRef = await manager.getRepository(Wallet).findOne({
          where: { user: { id: userId } },
          relations: ['user'],
        });

        if (!walletRef) {
          throw new NotFoundException('Wallet not found');
        }

        const wallet = await manager.getRepository(Wallet).findOne({
          where: { id: walletRef.id },
          lock: { mode: 'pessimistic_write' }, // SELECT ... FOR UPDATE
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
        }

        const balanceBefore = BigInt(wallet.balanceMinor);
        const amount = BigInt(amountMinor);

        if (balanceBefore < amount) {
          throw new BadRequestException('Insufficient funds');
        }

        const balanceAfter = balanceBefore - amount;

        wallet.balanceMinor = balanceAfter.toString();
        await manager.getRepository(Wallet).save(wallet);

        await manager.getRepository(Transaction).save(
          manager.getRepository(Transaction).create({
            walletId: wallet.id,
            type: 'withdraw',
            amountMinor: amountMinor.toString(),
            balanceBeforeMinor: balanceBefore.toString(),
            balanceAfterMinor: balanceAfter.toString(),
            reference: randomUUID(),
          }),
        );

        return { balanceMinor: wallet.balanceMinor };
      });
    } finally {
      await this.lockService.release(lockKey, token);
    }
  }

  async transfer(fromUserId: number, toEmail: string, amountMinor: number) {
    return this.dataSource.transaction(async (manager) => {
      const fromWalletRef = await manager.getRepository(Wallet).findOne({
        where: { user: { id: fromUserId } },
        relations: ['user'],
      });

      if (!fromWalletRef) {
        throw new NotFoundException('Wallet not found');
      }

      const toUser = await manager
        .getRepository(User)
        .findOne({ where: { email: toEmail } });

      if (!toUser) {
        throw new NotFoundException('Recipient not found');
      }

      if (toUser.id === fromUserId) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      const toWalletRef = await manager.getRepository(Wallet).findOne({
        where: { user: { id: toUser.id } },
        relations: ['user'],
      });

      if (!toWalletRef) {
        throw new NotFoundException('Recipient wallet not found');
      }

      // Lock both wallets in a consistent order (lower id first) to prevent deadlocks
      const [firstId, secondId] =
        fromWalletRef.id < toWalletRef.id
          ? [fromWalletRef.id, toWalletRef.id]
          : [toWalletRef.id, fromWalletRef.id];

      const first = await manager.getRepository(Wallet).findOne({
        where: { id: firstId },
        lock: { mode: 'pessimistic_write' },
      });
      const second = await manager.getRepository(Wallet).findOne({
        where: { id: secondId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!first || !second) {
        throw new NotFoundException('Wallet not found');
      }

      const fromWallet = first.id === fromWalletRef.id ? first : second;
      const toWallet = first.id === toWalletRef.id ? first : second;

      const amount = BigInt(amountMinor);
      const fromBalanceBefore = BigInt(fromWallet.balanceMinor);

      if (fromBalanceBefore < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const fromBalanceAfter = fromBalanceBefore - amount;
      const toBalanceBefore = BigInt(toWallet.balanceMinor);
      const toBalanceAfter = toBalanceBefore + amount;

      fromWallet.balanceMinor = fromBalanceAfter.toString();
      toWallet.balanceMinor = toBalanceAfter.toString();

      await manager.getRepository(Wallet).save(fromWallet);
      await manager.getRepository(Wallet).save(toWallet);

      const reference = randomUUID();

      await manager.getRepository(Transaction).save(
        manager.getRepository(Transaction).create({
          walletId: fromWallet.id,
          type: 'transfer_out',
          amountMinor: amountMinor.toString(),
          balanceBeforeMinor: fromBalanceBefore.toString(),
          balanceAfterMinor: fromBalanceAfter.toString(),
          reference,
        }),
      );

      await manager.getRepository(Transaction).save(
        manager.getRepository(Transaction).create({
          walletId: toWallet.id,
          type: 'transfer_in',
          amountMinor: amountMinor.toString(),
          balanceBeforeMinor: toBalanceBefore.toString(),
          balanceAfterMinor: toBalanceAfter.toString(),
          reference,
        }),
      );

      return { balanceMinor: fromWallet.balanceMinor };
    });
  }
}
