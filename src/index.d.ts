// ==================== COMMON ====================
type RedmineOptions = {
    apiKey: string;
    maxUploadSize?: number;     // Default: 5MB
}

type ProjectID = number | string;

type EnabledModuleNames =  'boards' | 'calendar' | 'documents' | 'files' | 'gantt' | 'issue_tracking' | 'news' | 'repository' | 'time_tracking' | 'wiki';

type CommonCustomField = {
    id: number;
    value: string;
}

type CommonUpload = {
    token: string;
    filename: string;
    content_type: string;
    description?: string;
}

type CommonPaginationParams = {
    limit?: number;
    offset?: number;
}


// ==================== PROJECTS ====================
// https://www.redmine.org/projects/redmine/wiki/Rest_Projects

type OptionalProjectParams = {
    description?: string;
    homepage?: string;
    is_public?: boolean;
    parent_id?: number;
    inherit_members?: boolean;
    tracker_ids?: number[];
    enabled_module_names?: EnabledModuleNames[];
    issue_custom_field_ids?: number[];
}

type CreateProjectParams = OptionalProjectParams & {
    name: string;
    identifier: string;
};

type UpdateProjectParams = OptionalProjectParams & {
    name?: string;
};

type ListProjectsParamsInclude = 'trackers' | 'issue_categories' |'enabled_modules';
type ListProjectsParams = CommonPaginationParams & {
    include?: ListProjectsParamsInclude[];
}

type GetProjectParamsInclude = ListProjectsParamsInclude | 'time_entry_activities';
type GetProjectParams = {
    include?: GetProjectParamsInclude[];
}

// ==================== ISSUES ====================
// https://www.redmine.org/projects/redmine/wiki/Rest_Issues

type OptionalIssueParams = {
    tracker_id?: number;
    status_id?: number;
    priority_id?: number;
    description?: string;
    category_id?: number;
    fixed_version_id?: number;
    assigned_to_id?: number;
    parent_issue_id?: number;
    custom_fields?: CommonCustomField[];
    watcher_user_ids?: number[];
    is_private?: boolean;
    estimated_hours?: number;
    uploads?: CommonUpload[];
}

type CreateIssueParams = OptionalIssueParams & {
    subject: string;
    project_id: number;
}

type UpdateIssueParams = OptionalIssueParams & {
    subject?: string;
    project_id?: number;
    notes?: string;
    private_notes?: boolean;
}

type ListIssuesParamsInclude = 'attachments' | 'relations';

type ListIssuesParams = CommonPaginationParams & {
    sort?: string;
    include?: ListIssuesParamsInclude[];

    issue_id?: number[] | string;
    project_id?: number;
    subproject_id?: number | string;
    tracker_id?: number;
    status_id?: number | 'open' | 'closed' | '*';
    assigned_to_id?: number | 'me';
    parent_id?: number;
    query_id?: number;
    // TODO currently cf_x is not supported :/ 
}

type GetIssueParamsInclude = ListIssuesParamsInclude | 'children' | 'changesets' | 'journals' | 'watchers';
type GetIssueParams = {
    include?: GetIssueParamsInclude[]
}


// ==================== MEMBERSHIPS ====================
// https://www.redmine.org/projects/redmine/wiki/Rest_Memberships

type MembershipParams = {
    user_id: number;
    role_ids: number[];
}

type UpdateMembership = {
    role_ids: number[];
}

type ListProjectMembersParams = CommonPaginationParams;

// ==================== USERS ====================
// https://www.redmine.org/projects/redmine/wiki/Rest_Users

type ListUsersParams = CommonPaginationParams & {
    status?: 0 | 1 | 2 | 3,
    name?: string;
    group_id?: number;
}

type UserMailNotifications = 'all' | 'selected' | 'only_my_events' | 'only_assigned' | 'only_owner' | 'none';

/* TODO
- Verify if all attributes should/can be changed during update!
- Can password be reseted by API? 
    https://www.redmine.org/boards/2/topics/54718
    https://www.redmine.org/projects/redmine/wiki/Rest_Users#PUT
    https://www.redmine.org/projects/redmine/repository/entry/branches/4.1-stable/app/controllers/users_controller.rb#L147
 */
type OptionalUserParams = {
    auth_source_id?: number;
    mail_notification?: UserMailNotifications;
    must_change_passwd?: boolean;
    generate_password?: boolean;
    admin?: boolean;
    status?: number;
}
type CreateUserParams = OptionalUserParams & {
    login: string;
    password: string;
    firstname: string;
    lastname: string;
    mail: string;
}

type UpdateUserParams = OptionalUserParams & {
    login?: string;
    firstname?: string;
    lastname?: string;
    mail?: string;
}

type GetUserParamsInclude = 'memberships' | 'groups';
type GetUserParams = {
    include?: GetUserParamsInclude[];
}


// ==================== TIME ENTRIES ====================
// https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries

type ListTimeEntryParams = CommonPaginationParams & {
    user_id?: number;
    project_id?: number;
    spent_on?: string;
    from?: string;
    to?: string;
}

type OptionalTimeEntryParams = {
    spent_on?: string;
    activity_id?: number;
    comments?: string;
    user_id?: number;
}
type CreateTimeEntryParams = OptionalTimeEntryParams & {
    issue_id: number;
    project_id?: never;
} | {
    issue_id?: never;
    project_id: number;
} & {
    hours: number;
}

type UpdateTimeEntryParams = OptionalTimeEntryParams & {
    project_id?: number;
    issue_id?: number;
    hours?: number;
}


// ==================== NEWS ====================
// https://www.redmine.org/projects/redmine/wiki/Rest_News
// or https://www.redmine.org/issues/13468

type ListNewsParams = CommonPaginationParams;

type GetNewsParamsInclude = 'attachments';
type GetNewsParams = {
    include?: GetNewsParamsInclude[];
}

type OptionalCreateNewsParams = {
    summary?: string;
    uploads?: CommonUpload[]
}

type CreateNewsParams = OptionalCreateNewsParams & {
    title: string;
    description: string;
}

type UpdateNewsParams = OptionalCreateNewsParams & {
    title?: string;
    description?: string;
}


// ==================== ISSUES RELATIONS  ====================

type CreateIssueRelations = {
    issue_to_id: number;
    relation_type?: 'relates' | 'duplicates' | 'duplicated' | 'blocks' | 'blocked' | 'precedes' | 'follows' | 'copied_to' | 'copied_from';
    delay?: number;
}


// ==================== VERSIONS ====================

type OptionalCreateVersionParams = {
    status?: 'open' | 'locked' | 'closed';
    sharing?: 'none' | 'descendants' | 'hierarchy' | 'tree' | 'system';
    due_date?: string;
    description?: string;
    wiki_page_title?: string;
}

type CreateVersionParams = OptionalCreateVersionParams & {
    name: string;
}

type UpdateVersionParams = OptionalCreateVersionParams & {
    name?: string;
}


// ==================== WIKI PAGES ====================

type GetWikiPageParams = {
    include?: 'attachments'
}

type CreateUpdateWikiPagesParams = {
    text: string;
    comments?: string;
    version?: number;
    parent_id?: number;
    uploads?: CommonUpload[];
}


// ==================== QUERIES ====================

// ==================== ATTACHMENTS ====================

type UpdateAttachment = {
    filename?: string;
    description?: string;
}


// ==================== ISSUE STATUSES ====================

// ==================== TRACKERS ====================

// ==================== ENUMERATIONS ====================

// ==================== ISSUE CATEGORIES ====================

type OptionalCreateIssueCategory = {
    assigned_to_id?: number;
}

type CreateIssueCategory = OptionalCreateIssueCategory & {
    name: string;
}

type UpdateIssueCategory = OptionalCreateIssueCategory & {
    name?: string;
}


// ==================== ROLES ====================

// ==================== GROUPS ====================

type CreateGroupParams = {
    name: string;
    user_ids?: number[];
}

type UpdateGroupParams = {
    name?: string;
}

type GetGroupParamsInclude = 'users' | 'memberships';
type GetGroupParams = {
    include?: GetGroupParamsInclude[];
}


// ==================== CUSTOM FIELDS ====================

// ==================== SEARCH ====================

type SearchParams = CommonPaginationParams;


// ==================== FILES ====================

type AddProjectFileParams = {
    token: string;
    version_id?: number;
    filename?: string;
    description?: string;
}


// ==================== MY ACCOUNT ====================

type UpdateMyAccountParams = {
    firstame?: string;
    lastname?: string;
    mail?: string;
}