import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { EncryptionContext } from '@aws-crypto/client-node';
import {
  DecryptCommand,
  DecryptCommandInput,
  EncryptCommand,
  EncryptCommandInput,
  KMSClient,
  ListKeysCommand,
} from '@aws-sdk/client-kms';

// add kms service for encryption and key management
@Injectable()
export class EncryptionService {

  private static kmsClient() {
    return new KMSClient({
      region: `${process.env.AWS_REGION_NAME}`,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
      },
    });
  }

  // private kmsClient = new KMSClient({
  //   region: `${process.env.AWS_REGION_NAME}`,
  //   credentials: {
  //     accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
  //     secretAccessKey: `${process.env.AWS_ACCESS_KEY_SECRET}`,
  //   },
  // });

  private algorithm = 'aes-256-cbc';

  private static key: string = crypto
    .createHash('sha512')
    .update(crypto.randomBytes(256))
    .digest('hex')
    .substring(0, 32);

  private static encryptionIV: string = crypto
    .createHash('sha512')
    .update(crypto.randomBytes(256))
    .digest('hex')
    .substring(0, 16);

  private context: EncryptionContext = {
    stage: 'test',
    purpose: 'to encrypt and decrypt ',
    origin: 'eu-west-2',
  };

  async kmsEncrypt(payload: string) {
    const buffer = Buffer.from(payload, 'utf8');

    const encryptInput: EncryptCommandInput = {
      KeyId: `${process.env.AWS_KMS_KEY_ID}`,
      Plaintext: buffer,
      EncryptionContext: this.context,
    };

    const encryptCommand = new EncryptCommand(encryptInput);

    const response = await EncryptionService.kmsClient().send(encryptCommand);

    return Buffer.from(response.CiphertextBlob).toString('base64');
  }

  async kmsDecryptAndVerify(payload: string) {

    const buffer = Buffer.from(payload, 'base64');

    const decryptInput: DecryptCommandInput = {
      CiphertextBlob: buffer,
      KeyId: `${process.env.AWS_KMS_KEY_ID}`,
      EncryptionContext: this.context,
    };

    const decryptCommand = new DecryptCommand(decryptInput);

    return await EncryptionService.kmsClient().send(decryptCommand);
  }

  async listKeys() {
    const command = await EncryptionService.kmsClient().send(
      new ListKeysCommand({}),
    );
    return command.Keys;
  }

  public async manualEncrypt(text: string) {
    const cipher = crypto.createCipheriv(
      this.algorithm,
      EncryptionService.key,
      EncryptionService.encryptionIV,
    );

    return Buffer.from(
      cipher.update(text, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  public async manualDecrypt(text: string) {
    const buff = Buffer.from(text, 'base64');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      EncryptionService.key,
      EncryptionService.encryptionIV,
    );
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }

  public async hash(text: string): Promise<string> {
    const saltRounds = 10;

    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(text, salt);
  }

  async compare(text: string, hash: string) {
    return await bcrypt.compare(text, hash);
  }
}
