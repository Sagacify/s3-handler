import { expect } from 'chai';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';
import { Readable } from 'stream';
import { sdkStreamMixin } from '@smithy/util-stream';

describe('S3Handler.getObjectBuffer', () => {
  const s3ClientMock = mockClient(S3Client);

  afterEach(() => {
    s3ClientMock.reset();
  });

  it('should get an object buffer', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream

    const sdkStream = sdkStreamMixin(stream);

    s3ClientMock.on(GetObjectCommand).resolvesOnce({ Body: sdkStream });

    const s3Handler = new S3Handler(s3ClientMock as unknown as S3Client, 'my-dummy-bucket');

    const responseBuffer = await s3Handler.getObjectBuffer('my-key');

    expect(s3ClientMock.commandCalls(GetObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(GetObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key'
    });
    expect(responseBuffer.Body).deep.equal(Buffer.from('hello world'));
  });

  it('should get an object buffer with additional options', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream

    const sdkStream = sdkStreamMixin(stream);

    s3ClientMock.on(GetObjectCommand).resolvesOnce({ Body: sdkStream });

    const s3Handler = new S3Handler(s3ClientMock as unknown as S3Client, 'my-dummy-bucket');

    const responseBuffer = await s3Handler.getObjectBuffer('my-key', { Range: 'bytes=0-5' });

    expect(s3ClientMock.commandCalls(GetObjectCommand).length).equal(1);
    expect(s3ClientMock.commandCalls(GetObjectCommand)[0].args[0].input).deep.equal({
      Bucket: 'my-dummy-bucket',
      Key: 'my-key',
      Range: 'bytes=0-5'
    });
    expect(responseBuffer.Body).deep.equal(Buffer.from('hello world'));
  });
});
