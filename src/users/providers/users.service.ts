import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = manager.create(User, { ...dto, password: hashedPassword });
        const savedUser = await manager.save(user);

        const wallet = manager.create(Wallet, {
          // 2. create a new wallet for the user
          user: savedUser,
          balanceMinor: '0',
        });
        await manager.save(wallet);

        return savedUser;
      });
    } catch (error) {
      const duplicateCodes = ['ER_DUP_ENTRY', '23505'];
      const databaseError = error as { code?: string };

      if (databaseError.code && duplicateCodes.includes(databaseError.code)) {
        throw new ConflictException('A user with this email already exists');
      }

      throw error;
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['wallet'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['wallet'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}
