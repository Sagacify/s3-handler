import { expect } from 'chai';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.putObject', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should put an object buffer', async () => {
    s3ClientMock.on(PutObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.putObject('my-key', Buffer.from('hello world'));

    expect(s3ClientMock.commandCalls(PutObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(PutObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key',
      Body: Buffer.from('hello world')
    });
  });

  it('should put an object buffer with additional options', async () => {
    s3ClientMock.on(PutObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.putObject('my-key', Buffer.from('hello world'), {
      ContentType: 'text/plain',
      ACL: 'public-read',
      Metadata: { myCustomId: '1' }
    });

    expect(s3ClientMock.commandCalls(PutObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(PutObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key',
      Body: Buffer.from('hello world'),
      ContentType: 'text/plain',
      ACL: 'public-read',
      Metadata: { myCustomId: '1' }
    });
  });
});
