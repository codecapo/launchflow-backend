import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class SignInRequest {
  @Prop()
  requestId: string;

  @Prop()
  nonce?: string;

  @Prop()
  publicKey: string;
}

export type SignInRequestDocument = SignInRequest &
  HydratedDocument<SignInRequest>;

export const SignInRequestSchema = SchemaFactory.createForClass(SignInRequest);
