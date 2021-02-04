# 0.3.0 (2021-02-04)

## Features:

- [#9](https://github.com/Jacqbus/redmine-ts/issues/9) Username/password authentication added. Additionally it is no longer required to provide an authentication method (this allows for sending inquiries about publicly available resources)
- [#10](https://github.com/Jacqbus/redmine-ts/issues/10) User Impersonation feature added
- [#11](https://github.com/Jacqbus/redmine-ts/issues/11) All types are now available for import

## Bugfix

- [#12](https://github.com/Jacqbus/redmine-ts/issues/12) Updated error handling

## Improvements
- [#8](https://github.com/Jacqbus/redmine-ts/issues/8) `done_ratio`, `start_date` and `due_date` parameters are available in create/update issue methods
- [#13](https://github.com/Jacqbus/redmine-ts/issues/13) Redundant files removed from npm, documentation updated

# 0.2.3 (2021-01-20)

- Fixed npm pipeline.

# 0.2.1 - 0.2.2 (2021-01-20)

- ❗ BROKEN VERSIONS - DO NOT USE ❗

# 0.2.0 (2021-01-20)

- Add changelog
- Add required `Content-Type': 'application/json`
- (fix) Change `projectId` type (`number` => `ProjectID`) in `addProjectMember` method
- (fix) Make `params` parameter optional in `listUsers` method
- (fix) Make `params` parameter optional in `listProjectNews` method

# 0.1.0 (2021-01-19)

- Initial release. 100% support of [Redmine's REST API](https://www.redmine.org/projects/redmine/wiki/rest_api)
- This version was tested with [Redmine 4.1.1 (2020-04-06)](https://www.redmine.org/projects/redmine/wiki/Changelog_4_1#411-2020-04-06)