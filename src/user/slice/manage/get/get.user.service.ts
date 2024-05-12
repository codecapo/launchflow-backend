import { User } from '../../../common/domain/entity/user.entity';
import { GetUserRepo } from './get.user.repo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUsersService {
  constructor(private readonly getUsersRepo: GetUserRepo) {}

  public async getUsers(): Promise<User[]> {
    return await this.getUsersRepo.getUsers();
  }
  public async getUser(walletAddress: string): Promise<User> {
    return await this.getUsersRepo.getUser(walletAddress);
  }
}
