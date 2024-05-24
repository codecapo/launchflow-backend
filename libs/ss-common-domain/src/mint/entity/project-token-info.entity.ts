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
  metadataUri: string;

  @Prop()
  mintAccountAddress: string;

  @Prop()
  supply: number;
}
