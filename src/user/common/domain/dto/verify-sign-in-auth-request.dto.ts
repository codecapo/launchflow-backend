import { Min } from 'class-validator';

export class VerifySignInAuthRequestDto {
  // @Min(1, {
  //   message: 'Please provide a public key for wallet auth verification',
  // })
  publicKey: string;

  // @Min(1, {
  //   message: 'Please provide a signature for wallet auth verification',
  // })
  signature: string;

  // @Min(1, {
  //   message: 'Please provide a signed message for wallet auth verification',
  // })
  message: string;
}
