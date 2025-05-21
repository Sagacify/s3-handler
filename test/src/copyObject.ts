import { expect } from 'chai';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.copyObject', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should copy an object', async () => {
    s3ClientMock.on(CopyObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.copyObject('my-dummy-bucket/my-key', 'my-new-key');

    expect(s3ClientMock.commandCalls(CopyObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(CopyObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-new-key',
      CopySource: `my-dummy-bucket/my-key`
    });
  });

  it('should copy an object with additional options', async () => {
    s3ClientMock.on(CopyObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.copyObject('my-dummy-bucket/my-key', 'my-new-key', {
      ContentType: 'text/plain',
      ACL: 'public-read',
      Metadata: { myCustomId: '1' },
      MetadataDirective: 'COPY'
    });

    expect(s3ClientMock.commandCalls(CopyObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(CopyObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-new-key',
      CopySource: `my-dummy-bucket/my-key`,
      ContentType: 'text/plain',
      ACL: 'public-read',
      Metadata: { myCustomId: '1' },
      MetadataDirective: 'COPY'
    });
  });
});
