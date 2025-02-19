import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';
import { expect } from 'chai';
import { Readable } from 'stream';
import { sdkStreamMixin } from '@smithy/util-stream';

describe('S3Handler.generatePresignedUrl', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should generate a pre-signed url', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream

    const sdkStream = sdkStreamMixin(stream);

    s3ClientMock.on(GetObjectCommand).resolvesOnce({ Body: sdkStream });

    const s3Handler = new S3Handler(new S3Client({ region: 'eu-west-1' }), 'my-dummy-bucket');

    const signedUrl = await s3Handler.generatePresignedUrl('my-key');

    expect(signedUrl).contains('https://my-dummy-bucket.s3.eu-west-1.amazonaws.com/my-key');
    expect(signedUrl).not.contains('X-Amz-Expires=60');
    expect(signedUrl).not.contains('range');
  });

  it('should generate a pre-signed url with additional options', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream

    const sdkStream = sdkStreamMixin(stream);

    s3ClientMock.on(GetObjectCommand).resolvesOnce({ Body: sdkStream });

    const s3Handler = new S3Handler(new S3Client({ region: 'eu-west-1' }), 'my-dummy-bucket');

    const signedUrl = await s3Handler.generatePresignedUrl(
      'my-key',
      { expiresIn: 60 },
      { Range: 'bytes=0-5' }
    );

    expect(signedUrl).contains('https://my-dummy-bucket.s3.eu-west-1.amazonaws.com/my-key');
    expect(signedUrl).contains('X-Amz-Expires=60');
    expect(signedUrl).contains('range');
  });
});
