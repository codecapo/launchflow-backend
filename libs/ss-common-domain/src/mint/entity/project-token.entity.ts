import { Prop, Schema } from '@nestjs/mongoose';
import { ProjectTokenInfo } from './project-token-info.entity';
import { SplTokenMetadata } from '@app/ss-common-domain/mint/entity/basic-metadata.entity';

@Schema({
  timestamps: true,
})
export class MintKeyPair {
  @Prop()
  mintPubKey: string;

  @Prop()
  mintPrivKey: string;
}

@Schema({
  timestamps: true,
})
export class ProjectToken {
  @Prop()
  projectTokenInfo?: ProjectTokenInfo;

  @Prop()
  mintKeys?: MintKeyPair;

  @Prop()
  basicMetadata?: SplTokenMetadata;
}
