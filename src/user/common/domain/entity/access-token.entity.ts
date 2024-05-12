import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class AccessToken {
  @Prop(
    raw({
      default: () => new Date(Date.now()),
      expires: 1000 * 60 * 60 * 8,
      type: Date,
    }),
  )
  expiresAt: Date;

  @Prop({ unique: true })
  userWalletAddress: string;

  @Prop()
  accessToken: string;
}

export type AccessTokenDocument = AccessToken & HydratedDocument<AccessToken>;

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);
