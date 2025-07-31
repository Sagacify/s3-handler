import { expect } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Handler } from '../../src/S3Handler';
import { S3Client } from '@aws-sdk/client-s3';

describe('S3Handler.createHandler (static)', () => {
  const s3ClientMock = mockClient(S3Client);

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it('should succeed when all parameters are provided', async () => {
    const create = () => S3Handler.createHandler({}, 'my-bucket');

    expect(create).not.throw();
  });
});
