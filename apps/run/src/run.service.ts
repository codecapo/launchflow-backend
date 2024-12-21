import { Injectable } from '@nestjs/common';

@Injectable()
export class RunService {
  getHello(): string {
    return 'Hello World!';
  }
}
