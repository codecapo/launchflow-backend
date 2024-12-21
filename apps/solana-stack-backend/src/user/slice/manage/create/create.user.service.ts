import { CreateUserRepo } from './create.user.repo';

import { Injectable } from '@nestjs/common';
import { User } from '@app/ss-common-domain/user/base/entity/user.entity';

@Injectable()
export class CreateUserService {
  constructor(private readonly createUseRepo: CreateUserRepo) {}
  async createUser(address: string): Promise<User> {
    if (!address) throw Error('Please provide address');

    const user: User = {
      publicKey: address,
      projectTokens: [],
    };

    return await this.createUseRepo.createUser(user);
  }
}
