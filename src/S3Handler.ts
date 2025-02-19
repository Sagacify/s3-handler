import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ObjectIdentifier,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Configuration, Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'node:stream';
import { RequestPresigningArguments, StreamingBlobPayloadInputTypes } from '@smithy/types';

export class S3Handler {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(client: S3Client, bucket: string) {
    this.client = client;
    this.bucket = bucket;
  }

  getClient() {
    return this.client;
  }

  async getObject(
    key: string,
    options: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}
  ): Promise<Buffer | null> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ...options
      })
    );

    if (response.Body) {
      const outputReadable = await response.Body.transformToByteArray();
      return Buffer.from(outputReadable);
    }

    return null;
  }

  async getObjectStream(key: string, options: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}) {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ...options
      })
    );
    return response.Body as Readable;
  }

  async putFolder(folderName: string) {
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: folderName.endsWith('/') ? folderName : `${folderName}/`
    });

    return this.client.send(putObjectCommand);
  }

  async putObject(
    key: string,
    buffer: Buffer,
    options: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'> = {}
  ) {
    const putObjectCommand = new PutObjectCommand({
      Body: buffer,
      Bucket: this.bucket,
      Key: key,
      ...options
    });

    return this.client.send(putObjectCommand);
  }

  uploadStream(
    key: string,
    body: StreamingBlobPayloadInputTypes,
    putObjectOptions: Omit<PutObjectCommandInput, 'Bucket' | 'Key'> = {},
    uploadOptions: Partial<Configuration> = {}
  ) {
    const parallelUploads3 = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ...putObjectOptions
      },
      ...uploadOptions
    });

    return parallelUploads3;
  }

  async listObjects(
    prefix: string,
    options: Omit<ListObjectsV2CommandInput, 'Bucket' | 'Prefix'> = {}
  ) {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      ...options
    });

    return this.client.send(listObjectsCommand);
  }

  async deleteObject(key: string, options: Omit<DeleteObjectCommandInput, 'Bucket' | 'Key'> = {}) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...options
    });

    return this.client.send(deleteObjectCommand);
  }

  async deleteObjects(
    objectsToDelete: ObjectIdentifier[],
    options: Omit<DeleteObjectsCommandInput, 'Bucket' | 'Delete'> = {}
  ) {
    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: { Objects: objectsToDelete },
      ...options
    });

    return this.client.send(deleteObjectsCommand);
  }

  async generatePresignedUrl(
    key: string,
    signedUrlOptions: RequestPresigningArguments = {},
    getObjectOptions: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}
  ) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key, ...getObjectOptions });
    return getSignedUrl(this.client, command, signedUrlOptions);
  }
}
export default S3Handler;
