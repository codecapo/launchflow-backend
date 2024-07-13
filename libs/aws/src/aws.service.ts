import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as crypto from 'node:crypto';

@Injectable()
export class AwsService {
  constructor() {}

  private static s3Client() {
    return new S3Client({
      region: process.env.AWS_REGION_NAME,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  public async uploadAsset(body: any) {
    const command = new PutObjectCommand({
      Bucket: 'solana-stack-files',
      Key: crypto.randomUUID(),
      Body: body,
    });

    return await AwsService.s3Client().send(command);
  }
  //
  // async upload(payload: {
  //   body: any;
  //   fileName: string;
  //   contentType: string;
  //   uploadCategory: 'reaper-docs';
  //   isUnique: boolean;
  // }): Promise<UploadResponse> {
  //   const folder = this.getFolderName();
  //   const bucketName = this.getBucketName(payload.uploadCategory);
  //   let fileName = `${uuidv4()}_${payload.fileName}`;
  //   if (!payload.isUnique) {
  //     fileName = `${payload.fileName}`;
  //   }
  //   const key = `${folder}${fileName}`;
  //
  //   const data = {
  //     Bucket: bucketName,
  //     Body: payload.body,
  //     ContentType: payload.contentType,
  //     Metadata: { fileName: payload.fileName },
  //     Key: key,
  //   };
  //   const storage = this.s3Instance;
  //   return await new Promise(function (resolve, reject) {
  //     storage.upload(data, function (err: any, data: any) {
  //       if (err) {
  //         Logger.error(err, 'InfrastructureModule');
  //         reject(err);
  //       }
  //       if (data) {
  //         const response: UploadResponse = { fileName: key };
  //         resolve(response);
  //       }
  //     });
  //   });
  // }
}
