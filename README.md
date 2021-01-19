# Redmine-ts

redmine-ts is Redmine REST API client written using TypeScript and using [Axios](https://www.npmjs.com/package/axios) for making requests.. It supports 100% of [Redmine's API features](https://www.redmine.org/projects/redmine/wiki/rest_api).

## Limitations:

- The current version only supports JSON format (implementation of XML versions is not planned)
- `apiKey` is the only authentication method right now

## Known problems:

1. The parameter `cf_x` in the `listIssues` method ([API ref](https://www.redmine.org/projects/redmine/wiki/Rest_Issues#Listing-issues)) was not included, so TypeScript reports an error. Currently, to work around this problem, please use `@ts-ignore`
2. `Search` method - Since [official documentation](https://www.redmine.org/projects/redmine/wiki/Rest_Search) are not completed yet, only `limit` and `offset` parameters are available.

# Installation

```
npm install --save redmine-ts
```

# Usage

```javascript
const fs = require('fs');
import {Redmine} from 'redmine-ts';

// Initialization (with all available parameters)
const redmine = new Redmine('https://redmine-hostname.com:3000', {
    /**
     *  apiKey (required) Redmine API key
     */
    apiKey: 'abcdef0123456789abcdef0123456789',
    
    /**
     * maxUploadSize (optional) Maximum size of sent files in bytes. Default value: 5242880 (5MB)
     * Note that it's only changes the maxBodyLength parameter of axios.
     * Max upload size accepted by Redmine needs to be setted by administrator in settings!
     */
    maxUploadSize: 5242880
});

// Example 1: List 5 issues
redmine.listIssues({
    limit: 5
})
.then(iObj => {
    console.log(`Showing ${iObj.issues.length} of ${iObj.total_count} total results:`, iObj.issues)
})
.catch(err) {
    console.log('List issues error:', err)
}

// Example 2: Add attachment to issue
const fileContent = fs.readFileSync('example-image.png');
redmine.uploadFile(fileContent).then(res => {
    const { token } = res.upload;

    redmine.updateIssue(1, {
        uploads: [
            token,
            filename: 'sweet-duckling.png',
            content_type: 'image/png',
            description: 'A photo of a yellow lovely duckling!'
        ]
    })
})
```

# License 

This software is distributed under the [MIT License](LICENSE.md).