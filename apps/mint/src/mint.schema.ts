import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MintedTokenDocument = HydratedDocument<MintedToken>;

@Schema({ timestamps: true })
export class MintedToken {

  @Prop()
  userWalletAddress: string;

  @Prop({ required: true })
  metadata: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  description: string;
}

export const MintedTokenSchema = SchemaFactory.createForClass(MintedToken);
