# Redmine-ts

redmine-ts is Redmine REST API client written using TypeScript and using [Axios](https://www.npmjs.com/package/axios) for making requests.. It supports 100% of [Redmine's API features](https://www.redmine.org/projects/redmine/wiki/rest_api).

# Installation

```
npm install --save redmine-ts
```

# Usage

```javascript
const fs = require('fs');
import {Redmine, RedmineTS} from 'redmine-ts';

// RedmineTS namespace can be used! (version 0.3.0+)
const redmineConfig: RedmineTS.Config = {
    /**
     * apiKey (optional) Redmine API key
     */
    apiKey: 'abcdef0123456789abcdef0123456789',

    /**
     * username (optional) Redmine username (login)
     */
    username: 'api-user',

    /**
     * password (optional) Redmine password
     */
    password: 'mySuperSecretPassword&TwoZero21',

    /**
     * impersonateUser (optional) Impersonate user login
     * See more: https://www.redmine.org/projects/redmine/wiki/rest_api#User-Impersonation
     */
    impersonateUser: 'secondUser',
    
    /**
     * maxUploadSize (optional) Maximum size of sent files in bytes. Default value: 5242880 (5MB)
     * Note that it's only changes the maxBodyLength parameter of axios.
     * Max upload size accepted by Redmine needs to be setted by administrator in settings!
     */
    maxUploadSize: 5242880
};

// Initialization
const redmine = new Redmine('https://redmine-hostname.com:3000', redmineConfig);

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

# Authentication

redmine-ts supports authentication using an API key as well as login/password. However, providing an authentication  is not required - this allows for sending inquiries about publicly available resources.

If three parameters are given: API key, login and password, the API key always takes precedence. Additionally, the library does not attempt to automatically log in with the login/password in case of an incorrect API key

# Additional

## Limitations:

- The current version only supports JSON format (implementation of XML versions is not planned)

- ~~`apiKey` is the only authentication method right now~~ Since version `0.3.0` both authentication methods are available 😊

## Known problems:

- ❗ Please use version `0.2.3` or above. Previous versions are broken by wrong pipeline configuration

- The parameter `cf_x` in the `listIssues` method ([API ref](https://www.redmine.org/projects/redmine/wiki/Rest_Issues#Listing-issues)) was not included, so TypeScript reports an error. Currently, to work around this problem, please use `@ts-ignore` ([Issue #20](https://github.com/Jacqbus/redmine-ts/issues/20))

- `Search` method - Since [official documentation](https://www.redmine.org/projects/redmine/wiki/Rest_Search) are not completed yet, only `limit` and `offset` parameters are available ([Issue #19](https://github.com/Jacqbus/redmine-ts/issues/19))

## Planned improvements

- ✔️ ~~Add support for username/password authentication~~ available from verion `0.3.0`

- ✔️ ~~Add support for [User-Impersonation](https://www.redmine.org/projects/redmine/wiki/rest_api#User-Impersonation)~~ available from verion `0.3.0`

# License 

This software is distributed under the [MIT License](LICENSE.md).