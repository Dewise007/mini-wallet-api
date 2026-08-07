import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserService } from './providers/users.service';
import { User } from './entities/user.entity';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), WalletsModule],
  controllers: [UsersController],
  providers: [UserService],
})
export class UsersModule {}
