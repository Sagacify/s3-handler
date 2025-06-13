import { expect } from 'chai';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.headObject', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should call headObject with the correct key', async () => {
    s3ClientMock.on(HeadObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.headObject('my-key');

    expect(s3ClientMock.commandCalls(HeadObjectCommand).length).to.equal(1);
    expect(s3ClientMock.commandCalls(HeadObjectCommand)[0].args[0].input).to.deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key'
    });
  });

  it('should call headObject and return metadata', async () => {
    s3ClientMock.on(HeadObjectCommand).resolvesOnce({
      Metadata: { myCustomId: '1' },
      ContentType: 'text/plain'
    });

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    const res = await s3Handler.headObject('my-key');

    expect(res).to.deep.equal({
      Metadata: { myCustomId: '1' },
      ContentType: 'text/plain'
    });

    expect(s3ClientMock.commandCalls(HeadObjectCommand).length).to.equal(1);
  });
});
