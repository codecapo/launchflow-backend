import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class ProjectTokenInfo {
  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop()
  symbol: string;

  @Prop()
  metadataUri?: string;

  @Prop()
  description: string;

  @Prop()
  supply: number;

  @Prop()
  mintPrivKey?: string;

  @Prop()
  mintPubKey: string;

  @Prop()
  mintAuthPrivKey: string;

  @Prop()
  mintAuthPubKey: string;
}
