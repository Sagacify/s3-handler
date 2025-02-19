import { expect } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';
import { S3Client } from '@aws-sdk/client-s3';

describe('S3Handler constructor', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should succeed when all parameters are provided', async () => {
    const create = () => new S3Handler(new S3Client({}), 'my-bucket');

    expect(create).not.throw();
  });
});
