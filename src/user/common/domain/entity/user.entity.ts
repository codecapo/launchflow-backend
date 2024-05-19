import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true })
  publicKey: string;
}

export type UserDocument = User & HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
