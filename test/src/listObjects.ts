import { expect } from 'chai';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.listObjects', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should list objects', async () => {
    s3ClientMock.on(ListObjectsV2Command).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.listObjects('/my-folder/');

    expect(s3ClientMock.commandCalls(ListObjectsV2Command).length).equal(1);
    expect(s3ClientMock.commandCalls(ListObjectsV2Command)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Prefix: '/my-folder/'
    });
  });

  it('should list objects with options', async () => {
    s3ClientMock.on(ListObjectsV2Command).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.listObjects('/my-folder/', { ContinuationToken: 'my-continuation-token' });

    expect(s3ClientMock.commandCalls(ListObjectsV2Command).length).equal(1);
    expect(s3ClientMock.commandCalls(ListObjectsV2Command)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Prefix: '/my-folder/',
      ContinuationToken: 'my-continuation-token'
    });
  });
});
