# 0.2.0 (2021-01-19)

- Add changelog
- Add required `Content-Type': 'application/json`
- (fix) Change `projectId` type (`number` => `ProjectID`) in `addProjectMember` method
- (fix) Make `params` parameter optional in `listUsers` method
- (fix) Make `params` parameter optional in `listProjectNews` method

# 0.1.0 (2021-01-19)

- Initial release. 100% support of [Redmine's REST API](https://www.redmine.org/projects/redmine/wiki/rest_api)
- This version was tested with [Redmine 4.1.1 (2020-04-06)](https://www.redmine.org/projects/redmine/wiki/Changelog_4_1#411-2020-04-06)