import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BasicMetadataUri {
  uri: string;
}

@Schema()
export class BasicMetadataProps {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

@Schema({
  timestamps: true,
})
export class SplTokenMetadata {
  @Prop()
  metadata: BasicMetadataProps;

  @Prop()
  pinnedUri: BasicMetadataUri;
}
