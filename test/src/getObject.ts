import { expect } from 'chai';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';
import { Readable } from 'stream';
import { sdkStreamMixin } from '@smithy/util-stream';

describe('S3Handler.getObject', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should get an object stream', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream

    const sdkStream = sdkStreamMixin(stream);

    s3ClientMock.on(GetObjectCommand).resolvesOnce({ Body: sdkStream });

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    const objectStream = await s3Handler.getObject('my-key');

    expect(s3ClientMock.commandCalls(GetObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(GetObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key'
    });
    expect(objectStream.Body).equal(sdkStream);
  });

  it('should get an object stream with additional options', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream

    const sdkStream = sdkStreamMixin(stream);

    s3ClientMock.on(GetObjectCommand).resolvesOnce({ Body: sdkStream });

    const s3Handler = new S3Handler(new S3Client({}), 'my-dummy-bucket');

    const objectStream = await s3Handler.getObject('my-key', { Range: 'bytes=0-5' });

    expect(s3ClientMock.commandCalls(GetObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(GetObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key',
      Range: 'bytes=0-5'
    });
    expect(objectStream.Body).equal(sdkStream);
  });
});
