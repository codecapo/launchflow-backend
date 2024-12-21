import { Injectable } from '@nestjs/common';

@Injectable()
export class LaunchService {
  getHello(): string {
    return 'Hello World!';
  }
}
