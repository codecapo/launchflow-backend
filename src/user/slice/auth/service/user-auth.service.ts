import { SolanaSignInInput } from '@solana/wallet-standard-features';
import * as base58 from 'bs58';
import * as nacl from 'tweetnacl';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UserAuthService {
  private logger: Logger = new Logger(UserAuthService.name);
  constructor() {}
  async userSignIn() {
    const now: Date = new Date();
    const uri = 'http://localhost:3000';
    const currentUrl = new URL(uri);
    const domain = currentUrl.host;
    const uuid = crypto.randomUUID();

    console.log(domain);
    // Convert the Date object to a string
    const currentDateTime = now.toISOString();

    const signInData: SolanaSignInInput = {
      domain,
      statement:
        'Solana Stack wants to sign you into the dapp using your wallet',
      version: '1',
      nonce: uuid,
      chainId: 'devnet',
      issuedAt: currentDateTime,
      requestId: crypto.randomUUID(),
    };

    return signInData;
  }

  async verifySignIn(msg: any, sig: any, pk: any) {
    const message = base58.decode(msg);
    const signature = base58.decode(sig);
    const publicKey = base58.decode(pk);

    const res = nacl.sign.detached.verify(message, signature, publicKey);

    if (res) {
      this.logger.log(`user ${pk} authentication successful`);
      return res;
    } else {
      this.logger.log(`user ${pk} authentication unsuccessful`);
      return res;
    }
  }
}

// if the wallet is verified we create a JWT token and return back to the frontend
// On each request, we will send the access token.
// when the access token is expired we will issue expired exception
// the frontend needs to sign in again.
