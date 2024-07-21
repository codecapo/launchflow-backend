import { Injectable } from '@nestjs/common';
import { CommonUserRepo } from '@app/ss-common-domain/user/base/repo/common.user.repo';
import { User } from '@app/ss-common-domain/user/base/entity/user.entity';

@Injectable()
export class CommonUserService {
  constructor(private readonly commonUserRepo: CommonUserRepo) {}

  public async getUser(userWalletAddress: string): Promise<User> {
    return await this.commonUserRepo.findUserByWalletAddress(userWalletAddress);
  }
}
