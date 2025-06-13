import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  HeadObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ObjectIdentifier,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Configuration, Upload } from '@aws-sdk/lib-storage';
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

  async getObject(key: string, options: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}) {
    return await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ...options
      })
    );
  }

  async getObjectBuffer(
    key: string,
    options: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}
  ): Promise<
    Omit<GetObjectCommandOutput, 'Body'> & {
      Body?: Buffer;
    }
  > {
    const response = await this.getObject(key, options);

    if (response.Body === undefined) {
      // explicitly override Body with undefined so that its type matches the expected type
      return { ...response, Body: undefined };
    }

    const byteArray = await response.Body.transformToByteArray();
    // This creates a view of the <ArrayBuffer> without copying the underlying memory
    // See: https://nodejs.org/api/buffer.html#static-method-bufferfromarraybuffer-byteoffset-length
    const bodyBuffer = Buffer.from(byteArray.buffer, byteArray.byteOffset, byteArray.byteLength);

    return {
      ...response,
      Body: bodyBuffer
    };
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
    body: PutObjectCommandInput['Body'],
    options: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'> = {}
  ) {
    const putObjectCommand = new PutObjectCommand({
      Body: body,
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

  async copyObject(
    sourceKey: string,
    destinationKey: string,
    options: Omit<CopyObjectCommandInput, 'Bucket' | 'Key' | 'CopySource'> = {}
  ) {
    const copyObjectCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: destinationKey,
      CopySource: sourceKey,
      ...options
    });
    return this.client.send(copyObjectCommand);
  }

  async generateGetPresignedUrl(
    key: string,
    signedUrlOptions: RequestPresigningArguments = {},
    getObjectOptions: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}
  ) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key, ...getObjectOptions });
    return getSignedUrl(this.client, command, signedUrlOptions);
  }

  async generatePutPresignedUrl(
    key: string,
    signedUrlOptions: RequestPresigningArguments = {},
    getObjectOptions: Omit<PutObjectCommandInput, 'Bucket' | 'Key'> = {}
  ) {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ...getObjectOptions });
    return getSignedUrl(this.client, command, signedUrlOptions);
  }

  async headObject(
    key: string,
    options: Omit<HeadObjectCommandInput, 'Bucket' | 'Key'> = {}
  ): Promise<HeadObjectCommandOutput> {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...options
    });

    return this.client.send(headObjectCommand);
  }
}

export default S3Handler;
