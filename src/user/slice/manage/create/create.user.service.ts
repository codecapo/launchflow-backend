import { CreateUserRepo } from './create.user.repo';
import { User } from '../../../common/domain/entity/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserService {
  constructor(private readonly createUseRepo: CreateUserRepo) {}
  async createUser(address: string) {
    if (!address) throw Error('Please provide address');

    const user: User = {
      publicKey: address,
    };

    return await this.createUseRepo.createUser(user);
  }
}
