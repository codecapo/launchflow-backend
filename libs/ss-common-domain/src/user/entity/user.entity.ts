import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectToken } from '@app/ss-common-domain/mint/entity/project-token.entity';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true })
  publicKey: string;

  @Prop()
  projectTokens: ProjectToken[];
}

export type UserDocument = User & HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
