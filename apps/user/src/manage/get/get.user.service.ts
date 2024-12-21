import { GetUserRepo } from './get.user.repo';
import { Injectable } from '@nestjs/common';
import { User } from '@app/ss-common-domain/user/base/entity/user.entity';

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
