import { expect } from 'chai';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.putFolder', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should create a folder', async () => {
    s3ClientMock.on(PutObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.putFolder('my-folder');

    expect(s3ClientMock.commandCalls(PutObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(PutObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-folder/'
    });
  });
});
