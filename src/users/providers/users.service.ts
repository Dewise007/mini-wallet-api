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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = this.usersRepository.create(dto);
      const savedUser = await this.usersRepository.save(user);

      const wallet = this.walletsRepository.create({
        user: savedUser,
        balanceMinor: '0',
      });

      await this.walletsRepository.save(wallet);

      return savedUser;
    } catch (error: unknown) {
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
