import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import { envConfig } from '../../src/shared/config/app.config';

@Injectable()
export class S3Service {
  private readonly s3Client = new S3Client({
    region: envConfig.S3.awsRegion,
  });

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string,
    phoneNumber: string,
  ) {
    try {
      const fileContent = file.buffer;
      const fileKey = `bz-${phoneNumber}-${file.originalname}`;
      await this.uploadFileToS3(
        bucketName,
        fileKey,
        fileContent,
        file.mimetype,
      );

      return fileKey;
    } catch (error) {
      throw error;
    }
  }

  async uploadFileToS3(
    bucketName: string,
    key: string,
    fileContent: Buffer,
    contentType: string,
  ) {
    try {
      const putObject = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
      });
      return await this.s3Client.send(putObject);
    } catch (error) {
      throw error;
    }
  }

  async deleteObjectFromS3(fileName: string, bucket: string) {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: fileName });
    const deletedS3Res = await this.s3Client.send(command);
    return deletedS3Res;
  }

  async getSignedFileUrl(fileName: string, bucket: string) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });

    const preSignUrlOptions = {
      expiresIn: Number(envConfig.S3.timeOut),
      httpMethod: 'GET',
    };

    try {
      return await getSignedUrl(this.s3Client, command, preSignUrlOptions);
    } catch (error) {
      console.log('Error: Unable to get signed Url', error);
      return null;
    }
  }

  async uploadImageFromDriveUrlToS3(driveUrl: string): Promise<string> {
    try {
      const fileIdMatch = driveUrl.match(/[-\w]{25,}/);
      if (!fileIdMatch) {
        throw new Error('Invalid Google Drive URL');
      }

      const fileId = fileIdMatch[0];
      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      const response = await axios.get(directDownloadUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data, 'binary');
      let contentType = response.headers['content-type'];

      // Check if the content-type is application/octet-stream
      if (contentType === 'application/octet-stream') {
        if (
          driveUrl.endsWith('.svg') ||
          buffer.toString('utf-8').includes('<svg')
        ) {
          contentType = 'image/svg+xml';
        } else {
          throw new HttpException(
            'File type could not be determined',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const bucketName = envConfig.S3.creativePotentialBucket;
      const fileKey = `${fileId}.svg`;

      try {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        });

        const existFile = await this.s3Client.send(command);

        if (existFile) {
          console.log('File Already Exists, skipping upload');
          return fileKey;
        }
      } catch (err) {
        if (err.name === 'NoSuchKey') {
          await this.uploadFileToS3(bucketName, fileKey, buffer, contentType);
        } else {
          throw err;
        }
      }
      return fileKey;
    } catch (error) {
      throw new HttpException(
        `Failed to upload image from Google Drive: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
