# S3Handler

[![Coverage Status](https://coveralls.io/repos/github/Sagacify/s3-handler/badge.svg?branch=master)](https://coveralls.io/github/Sagacify/s3-handler?branch=master)
[![npm version](https://img.shields.io/npm/v/@sagacify/s3-handler.svg)](https://www.npmjs.com/package/@sagacify/s3-handler)

## Description

S3Handler is a package meant to simplify the handeling of S3 messages.
It does automatic JSON parsing/stringifying of the message's body,
attiributes composition and parsing of message's attributes.
This package has a peer-dependency on the AWS sdk v3.

## Installation

```sh
npm install @sagacify/s3-handler
```

## Usage

### Import in your project

```js
import { S3Client } from '@aws-sdk/client-s3';
import { S3Handler } from '@sagacify/s3-handler';

const s3Client = new S3Client({ region: 'eu-west-1' });

const s3Handler = new S3Handler(s3Client, 'my-bucket-name');

// Get object
await s3Handler.getObject('my-key');

// Get object Buffer (response.Body is accumulate in a Buffer)
await s3Handler.getObjectBuffer('my-key');

// Put object
await s3Handler.putObject('my-key', Buffer.from('hello-world'));

// List objects
await s3Handler.listObjects('my-prefix');

// Delete object
await s3Handler.deleteObject('my-key');

// Delete several objects
await s3Handler.deleteObjects([{ Key: 'my-key1' }, { Key: 'my-key2' }]);

// Copy object
await s3Handler.copyObject('bucket/my-key', 'my-new-key');
```

### Readable Stream Usage

```js
import { S3Client } from '@aws-sdk/client-s3';
import { S3Handler } from '@sagacify/s3-handler';

const s3Client = new S3Client({ region: 'eu-west-1' });

const s3Handler = new S3Handler(s3Client, 'my-bucket-name');

const response = s3Handler.getObject('my-super-heavy-file');
const readable = response.Body as Readable;

readable.on('data', (message) => {
  console.log(message);
});
```

### Upload Stream Usage

```js
import { S3Client } from '@aws-sdk/client-s3';
import { S3Handler } from '@sagacify/s3-handler';

const s3Client = new S3Client({ region: 'eu-west-1' });

const s3Handler = new S3Handler(s3Client, 'my-bucket-name');

const parallelUploadStream = s3Handler.uploadStream('my-key', Buffer.from('my-super-heavy-file'));

await parallelUpload.done();
```

## Npm scripts

### Running code formating

```sh
npm run format
```

### Running tests

```sh
npm test
```

### Running lint tests

```sh
npm test:lint
```

### Running coverage tests

```sh
npm test:cover
```

This will create a coverage folder with all the report in `coverage/index.html`

### Running all tests

```sh
npm test:all
```

_Note: that's the one you want to use most of the time_

## Reporting bugs and contributing

If you want to report a bug or request a feature, please open an issue.
If want to help us improve s3-handler, fork and make a pull request.
Please use commit format as described [here](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).
And don't forget to run `npm run format` before pushing commit.

## Repository

- [https://github.com/sagacify/s3-handler](https://github.com/sagacify/s3-handler)

## License

The MIT License (MIT)

Copyright (c) 2020 Sagacify

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
