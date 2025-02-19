import { expect } from 'chai';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';

describe('S3Handler.deleteObject', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should delete object', async () => {
    s3ClientMock.on(DeleteObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.deleteObject('key-to-delete');

    expect(s3ClientMock.commandCalls(DeleteObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(DeleteObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'key-to-delete'
    });
  });

  it('should delete object with additional options', async () => {
    s3ClientMock.on(DeleteObjectCommand).resolvesOnce({});

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    await s3Handler.deleteObject('key-to-delete', { IfMatchSize: 123 });

    expect(s3ClientMock.commandCalls(DeleteObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(DeleteObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'key-to-delete',
      IfMatchSize: 123
    });
  });
});
