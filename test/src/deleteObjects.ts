import { expect } from 'chai';
import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.deleteObjects', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should delete objects', async () => {
    s3ClientMock.on(DeleteObjectsCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.deleteObjects([{ Key: 'my-key' }, { Key: 'my-key-2' }]);

    expect(s3ClientMock.commandCalls(DeleteObjectsCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(DeleteObjectsCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Delete: { Objects: [{ Key: 'my-key' }, { Key: 'my-key-2' }] }
    });
  });

  it('should delete objects with additional options', async () => {
    s3ClientMock.on(DeleteObjectsCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.deleteObjects([{ Key: 'my-key' }, { Key: 'my-key-2' }], {
      ChecksumAlgorithm: 'SHA256'
    });

    expect(s3ClientMock.commandCalls(DeleteObjectsCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(DeleteObjectsCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Delete: { Objects: [{ Key: 'my-key' }, { Key: 'my-key-2' }] },
      ChecksumAlgorithm: 'SHA256'
    });
  });
});
