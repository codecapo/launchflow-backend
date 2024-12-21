import { Injectable } from '@nestjs/common';

@Injectable()
export class BuyService {
  getHello(): string {
    return 'Hello World!';
  }
}
