import { expect } from 'chai';
import {
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.putObjectStream', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should put an object stream', async () => {
    s3ClientMock.on(PutObjectCommand).resolves({});
    s3ClientMock.on(CreateMultipartUploadCommand).resolves({});
    s3ClientMock.on(UploadPartCommand).resolves({});

    const s3Handler = new S3Handler(new S3Client({ region: 'eu-west-1' }), 'my-dummy-bucket');

    const streamUpload = s3Handler.uploadStream('my-key', Buffer.from('hello world'));
    await streamUpload.done();
    expect(s3ClientMock.commandCalls(PutObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(PutObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key',
      Body: Buffer.from('hello world')
    });
  });

  it('should put an object buffer', async () => {
    s3ClientMock.on(PutObjectCommand).resolves({});
    s3ClientMock.on(CreateMultipartUploadCommand).resolves({});
    s3ClientMock.on(UploadPartCommand).resolves({});

    const s3Handler = new S3Handler(new S3Client({ region: 'eu-west-1' }), 'my-dummy-bucket');

    const streamUpload = s3Handler.uploadStream(
      'my-key',
      Buffer.from('hello world'),
      { Metadata: { myCustomId: '1' } },
      { partSize: 1024 * 1024 * 5, queueSize: 4 }
    );

    await streamUpload.done();

    expect(s3ClientMock.commandCalls(PutObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(PutObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key',
      Body: Buffer.from('hello world'),
      Metadata: { myCustomId: '1' }
    });
  });
});
