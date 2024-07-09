import { Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from '@app/encryption';
import * as base58 from 'bs58';

import { DraftMintRepo } from './draft.mint.repo';
import { DraftMintDto } from '@app/ss-common-domain/mint/dto/draft-mint.dto';
import {
  MintKeyPair,
  ProjectToken,
} from '@app/ss-common-domain/mint/entity/project-token.entity';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';

@Injectable()
export class DraftMintService {
  private logger: Logger = new Logger(DraftMintService.name);
  constructor(
    private readonly solsUtils: SolsUtils,
    private readonly encryptionService: EncryptionService,
    private readonly draftMintRepo: DraftMintRepo,
  ) {}

  public async createDraftMint(
    userWalletAddress: string,
  ): Promise<DraftMintDto> {
    const mintKeyPair = await this.solsUtils.initialiseMintKeyPair();
    const encodedBase58PrivKey = base58.encode(mintKeyPair.secretKey);
    const encryptedPrivKey =
      await this.encryptionService.kmsEncrypt(encodedBase58PrivKey);

    const saveMintKeyPair: MintKeyPair = {
      mintPrivKey: encryptedPrivKey,
      mintPubKey: mintKeyPair.publicKey,
    };

    const projectToken: ProjectToken = {
      mintKeys: saveMintKeyPair,
    };

    const saveDraftMint = await this.draftMintRepo.draftMintForUser(
      userWalletAddress,
      projectToken,
    );

    if (!(saveDraftMint.modifiedCount == 0)) {
      const draftMintDto: DraftMintDto = {
        mintPriv: encodedBase58PrivKey,
        mintPub: mintKeyPair.publicKey,
      };

      this.logger.log(`Created draft mint for user ${userWalletAddress}`);
      return draftMintDto;
    } else {
      throw Error('Could not created draft mint, please try again');
    }
  }
}
