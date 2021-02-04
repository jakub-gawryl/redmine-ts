/**
 * Redmine REST API client written in TypeScript
 * 
 * MIT License 2021 Jakub Gawryl
 * 
 */

import axios, { AxiosRequestConfig, Method , AxiosResponse} from 'axios';

export class Redmine {

    private baseURL: string;
    private options: RedmineTS.Config;

    private conn: any;

    /**
     * Constructor
     * @param host 
     * @param options 
     */
    constructor(baseUrl: string, options: RedmineTS.Config) {
        if (!baseUrl) {
            throw Error('Redmine host is not specified!')
        }

        this.baseURL = baseUrl;
        this.options = options;
    }


    // ==================== PRIVATE METHODS ====================

    /**
     * Deeply iterate through given object and replace all found arrays into comma separated strings.
     * 
     * @param obj 
     */
    private static _deepJoinArrays(obj: any) {
        const newObj: any = {};
        for (const k in obj) {
            const v = obj[k];
            newObj[k] = (typeof v === "object") ? (Array.isArray(v)) ? v.join(",") : Redmine._deepJoinArrays(v) : v;
        }
        return newObj;
    }

    /**
     * Creates connection (if there's not any) and sends request to redmine API
     * @param method    HTTP methos (GET, POST, PUT, DELETE, etc)
     * @param path      Redmine API path (without initial "/" and format eg. "issues/1")
     * @param params    Parameters that are sent with request
     */
    private request(method: Method, path: string, params: any = {}): Promise<any> {
        // Create connection (if not present)
        if (!this.conn) {
            const connConfig: AxiosRequestConfig = {
                baseURL: this.baseURL,
                maxBodyLength: this.options.maxUploadSize || 5242880, // Default: 5MB
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { apiKey, username, password } = this.options;

            if (apiKey) {
              connConfig.headers['X-Redmine-API-Key'] = apiKey;
            }
            else if (username && password) {
              connConfig.auth = {
                username,
                password
              };
            }

            this.conn = axios.create(connConfig);
        }

        const isUpload = path === 'uploads';

        return this.conn[method.toLocaleLowerCase()](
                `/${path}.json`,
                (method === "GET" || method === "get") ? Redmine._deepJoinArrays(params) : params,
                (isUpload) ? {headers: {'Content-Type': 'application/octet-stream'}} : {}
            )
            .then((res: AxiosResponse) => res.data)
            .catch((err: any) => {
                // Check for axios connection error
                if (err.errno) {
                    throw Error(`Axios connection problem (${err.config.baseURL}): ${err.errno}`)
                }

                if (err.response) {
                  let message = `${err.response.status} ${err.response.statusText} (${err.request.path})`;

                  if (Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
                    message += `\n${err.response?.data.errors.join(", ")}`
                  }
                  throw Error(message);
                }
                else {
                    throw err;
                }
            })
    }

    // ==================== PROJECTS ====================

    /**
     * Get list of projects
     * http://www.redmine.org/projects/redmine/wiki/Rest_Projects#Listing-projects
     * 
     * @param params
     */
    public listProjects(params?: RedmineTS.Projects.ListParams): Promise<any> {
        return this.request('get', 'projects', { params })
    }

    /**
     * Create project
     * http://www.redmine.org/projects/redmine/wiki/Rest_Projects#Creating-a-project
     * 
     * @param project
     */
    public createProject(project: RedmineTS.Projects.CreateParams): Promise<any> {
        return this.request('post', 'projects', { project })
    }

    /**
     * Get project
     * http://www.redmine.org/projects/redmine/wiki/Rest_Projects#Showing-a-project
     * 
     * @param projectId 
     * @param params
     */
    public getProject(projectId: RedmineTS.Projects.ID, params?: RedmineTS.Projects.GetParams): Promise<any> {
        return this.request('get', `projects/${projectId}`, { params })
    }

    /**
     * Update project
     * http://www.redmine.org/projects/redmine/wiki/Rest_Projects#Updating-a-project
     * 
     * @param projectId 
     * @param project
     */
    public updateProject(projectId: RedmineTS.Projects.ID, project: RedmineTS.Projects.UpdateParams): Promise<any> {
        return this.request('put', `projects/${projectId}`, { project })
    }

    /**
     * Delete project
     * https://www.redmine.org/projects/redmine/wiki/Rest_Projects#Deleting-a-project
     * 
     * @param projectId
     */
    public deleteProject(projectId: RedmineTS.Projects.ID): Promise<any> {
        return this.request('delete', `projects/${projectId}`)
    }


    // ==================== ISSUES ====================

    /**
     * Get list of issues
     * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Listing-issues
     * 
     * @param params 
     */
    public listIssues(params?: RedmineTS.Issues.ListParams): Promise<any> {
        return this.request('get', 'issues', { params })
    }

    /**
     * Create issue
     * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Creating-an-issue
     * 
     * @param issue
     */
    public createIssue(issue: RedmineTS.Issues.CreateParams): Promise<any> {
        return this.request('post', 'issues', { issue })
    }

    /**
     * Get issue
     * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Showing-an-issue
     * 
     * @param issueId 
     * @param params
     */
    public getIssue(issueId: number, params?: RedmineTS.Issues.GetParams): Promise<any> {
        return this.request('get', `issues/${issueId}`, { params })
    }

    /**
     * Update issue
     * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Updating-an-issue
     * 
     * @param issueId
     * @param issue
     */
    public updateIssue(issueId: number, issue: RedmineTS.Issues.UpdateParams): Promise<any> {
        return this.request('put', `issues/${issueId}`, { issue })
    }

    /**
     * Delete issue
     * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Deleting-an-issue
     * 
     * @param issueId
     */
    public deleteIssue(issueId: number): Promise<any> {
        return this.request('delete', `issues/${issueId}`)
    }

    /**
     * Adds watcher to issue
     * https://www.redmine.org/projects/redmine/wiki/Rest_Issues#Adding-a-watcher
     * 
     * @param issueId 
     * @param watcherId 
     */
    public addWatcher(issueId: number, watcherId: number): Promise<any> {
        return this.request('post', `issues/${issueId}/watchers`, {
            user_id: watcherId
        })
    }

    /**
     * Remove watcher from issue
     * https://www.redmine.org/projects/redmine/wiki/Rest_Issues#Removing-a-watcher
     * 
     * @param issueId 
     * @param watcherId 
     */
    public removeWatcher(issueId: number, watcherId: number): Promise<any> {
        return this.request('delete', `issues/${issueId}/watchers/${watcherId}`)
    }


    // ==================== MEMBERSHIPS ====================

    /**
     * Returns a paginated list of the project memberships.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Memberships#GET
     * 
     * @param projectId can be either the project numerical id or the project identifier.
     */
    public listProjectMembers(projectId: RedmineTS.Projects.ID, params?: RedmineTS.Memberships.ListProjectMembersParams): Promise<any> {
        return this.request('get', `projects/${projectId}/memberships`, { params })
    }

    /**
     * Adds a project member.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Memberships#POST
     * 
     * @param projectId  can be either the project numerical id or the project identifier.
     * @param membership 
     */
    public addProjectMember(projectId: RedmineTS.Projects.ID, membership: RedmineTS.Memberships.AddParams): Promise<any> {
        return this.request('post', `projects/${projectId}/memberships`, { membership })
    }
    
    /**
     * Returns the membership of given id
     * https://www.redmine.org/projects/redmine/wiki/Rest_Memberships#GET-2
     * 
     * @param membershipId 
     */
    public getMembership(membershipId: number): Promise<any> {
        return this.request('get', `memberships/${membershipId}`)
    }

    /**
     * Updates the membership of given id. Only the roles can be updated, the project and the user of a membership are read-only.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Memberships#PUT
     * 
     * @param membershipId 
     * @param membership 
     */
    public updateMembership(membershipId: number, membership: RedmineTS.Memberships.UpdateParams): Promise<any> {
        return this.request('put', `memberships/${membershipId}`, { membership })
    }

    /**
     * Deletes a memberships. Memberships inherited from a group membership can not be deleted. You must delete the group membership.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Memberships#DELETE
     * 
     * @param membershipId 
     */
    public deleteMembership(membershipId: number): Promise<any> {
        return this.request('delete', `memberships/${membershipId}`)
    }


    // ==================== USERS ====================

    /**
     * Returns a list of users. This endpoint requires admin privileges.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Users#GET
     * 
     * @param params 
     */
    public listUsers(params?: RedmineTS.Users.ListParams): Promise<any> {
        return this.request('get', 'users', { params })
    }

    /**
     * Creates a user. This endpoint requires admin privileges.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Users#POST
     * 
     * @param user 
     * @param sendToUser 
     */
    public createUser(user: RedmineTS.Users.CreateParams, sendToUser: boolean = false): Promise<any> {
        return this.request('post', 'users', {
            user,
            send_information: sendToUser
        })
    }

    /**
     * Returns the user details. This endpoint can be used by admin or non admin but the returned fields will
     * depend on the privileges of the requesting user. Details available in documentation:
     * https://www.redmine.org/projects/redmine/wiki/Rest_Users#GET-2
     * 
     * @param userId Id of the user or 'current' for retrieving the user whose credentials are used to access the API.
     * @param params 
     */
    public getUser(userId: number | 'current', params?: RedmineTS.Users.GetParams): Promise<any> {
        return this.request('get', `users/${userId}`, { params })
    }

    /**
     * Updates a user. This endpoint requires admin privileges.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Users#PUT
     * 
     * @param userId 
     * @param user 
     */
    public updateUser(userId: number | 'current', user: RedmineTS.Users.UpdateParams): Promise<any> {
        return this.request('put', `users/${userId}`, { user })
    }

    /**
     * Deletes a user. This endpoint requires admin privileges.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Users#DELETE
     * 
     * @param userId 
     */
    public deleteUser(userId: number | 'current'): Promise<any> {
        return this.request('delete', `users/${userId}`)
    }


    // ==================== TIME ENTRIES ====================

    /**
     * Return time entries.
     * https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries#Listing-time-entries
     * 
     * @param params 
     */
    public listTimeEntries(params?: RedmineTS.TimeEntries.ListParams): Promise<any> {
        return this.request('get', 'time_entries', { params })
    }

    /**
     * Returns the time entry of given id.
     * https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries#Showing-a-time-entry
     * 
     * @param teId 
     */
    public getTimeEntry(teId: number): Promise<any> {
        return this.request('get', `time_entries/${teId}`)
    }

    /**
     * Creates a time entry. It's apply to the issue or project but only one is required!
     * (so only issue_id OR project_id can be passed here!)
     * https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries#Creating-a-time-entry
     * 
     * @param timeEntry
     */
    public createTimeEntry(timeEntry: RedmineTS.TimeEntries.CreateParams): Promise<any> {
        return this.request('post', 'time_entries', {
            time_entry: timeEntry
        })
    }

    /**
     * Updates the time entry of given id.
     * IMPORTANT NOTE: If time entry is transferred from one project to another (by changing project_id),
     * the issue_id parameter must be set to null (or issue id which belongs to a new project)
     * Otherwise, the method may return the error 'Issue is invalid'
     * https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries#Updating-a-time-entry
     * 
     * @param teId 
     * @param timeEntry 
     */
    public updateTimeEntry(teId: number, timeEntry: RedmineTS.TimeEntries.UpdateParams): Promise<any> {
        return this.request('put', `time_entries/${teId}`, {
            time_entry: timeEntry
        })
    }

    /**
     * Deletes the time entry of given id.
     * https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries#Deleting-a-time-entry
     * 
     * @param teId 
     */
    public deleteTimeEntry(teId: number): Promise<any> {
        return this.request('delete', `time_entries/${teId}`)
    }


    // ==================== NEWS ====================

    /**
     * Returns all news across all projects with pagination.
     * https://www.redmine.org/projects/redmine/wiki/Rest_News#GET
     * 
     * @param params 
     */
    public listAllNews(params?: RedmineTS.News.ListParams): Promise<any> {
        return this.request('get', 'news', { params });
    }

    /**
     * Returns all news from project with given id or identifier with pagination.
     * https://www.redmine.org/projects/redmine/wiki/Rest_News#GET-2
     * 
     * @param projectId 
     * @param params 
     */
    public listProjectNews(projectId: RedmineTS.Projects.ID, params?: RedmineTS.News.ListParams): Promise<any> {
        return this.request('get', `projects/${projectId}/news`, { params });
    }

    /**
     * Get single news (Released in Redmine 4.1.0 but not yet documented)
     * https://www.redmine.org/projects/redmine/repository/revisions/18441
     * 
     * @param newsId 
     */
    public getNews(newsId: number, params?: RedmineTS.News.GetParams): Promise<any> {
        return this.request('get', `news/${newsId}`, { params })
    }

    /**
     * Create news (Released in Redmine 4.1.0 but not yet documented)
     * https://www.redmine.org/projects/redmine/repository/revisions/18440
     * 
     * @param news 
     */
    public createNews(projectId: RedmineTS.Projects.ID, news: RedmineTS.News.CreateParams): Promise<any> {
        return this.request('post', `projects/${projectId}/news`, { news })
    }

    /**
     * Update news (Released in Redmine 4.1.0 but not yet documented)
     * https://www.redmine.org/projects/redmine/repository/revisions/18443
     * 
     * @param newsId 
     * @param news 
     */
    public updateNews(newsId: number, news: RedmineTS.News.UpdateParams): Promise<any> {
        return this.request('put', `news/${newsId}`, { news })
    }

    /**
     * Delete news (Released in Redmine 4.1.0 but not yet documented)
     * https://www.redmine.org/projects/redmine/repository/revisions/18442
     * 
     * @param newsId 
     */
    public deleteNews(newsId: number): Promise<any> {
        return this.request('delete', `news/${newsId}`)
    }


    // ==================== ISSUES RELATIONS  ====================

    /**
     * Returns the relations for the issue of given id (not relation id!)
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueRelations#GET
     * 
     * @param issueId 
     */
    public listIssueRelations(issueId: number): Promise<any> {
        return this.request('get', `issues/${issueId}/relations`)
    }

    /**
     * Creates a relation for the issue of given id (not relation id!)
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueRelations#POST
     * 
     * @param issueId 
     * @param relation 
     */
    public createIssueRelation(issueId: number, relation: RedmineTS.IssueRelations.CreateParams): Promise<any> {
        return this.request('post', `issues/${issueId}/relations`, { relation })
    }

    /**
     * Returns the relation of given id  (not issue id!)
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueRelations#GET-2
     * 
     * @param relationId 
     */
    public getIssueRelation(relationId: number): Promise<any> {
        return this.request('get', `relations/${relationId}`)
    }

    /**
     * Deletes the relation of given id (not issue id!)
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueRelations#DELETE
     * 
     * @param relationId 
     */
    public deleteIssueRelation(relationId: number): Promise<any> {
        return this.request('delete', `relations/${relationId}`)
    }


    // ==================== VERSIONS ====================

    /**
     * Returns the versions available for the project of given id or identifier.
     * The response may include shared versions from other projects.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Versions#GET
     * 
     * @param projectId 
     */
    public listProjectVersions(projectId: RedmineTS.Projects.ID): Promise<any> {
        return this.request('get', `projects/${projectId}/versions`)
    }

    /**
     * Creates a version for the project of given id or identifier
     * https://www.redmine.org/projects/redmine/wiki/Rest_Versions#POST
     * 
     * @param projectId
     * @param version
     */
    public createProjectVersion(projectId: RedmineTS.Projects.ID, version: RedmineTS.Versions.CreateParams): Promise<any> {
        return this.request('post', `projects/${projectId}/versions`, { version })
    }

    /**
     * Returns the version of given id.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Versions#GET-2
     * 
     * @param versionId 
     */
    public getProjectVersion(versionId: number): Promise<any> {
        return this.request('get', `versions/${versionId}`)
    }

    /**
     * Updates the version of given id
     * https://www.redmine.org/projects/redmine/wiki/Rest_Versions#PUT
     * 
     * @param versionId 
     * @param version 
     */
    public updateProjectVersion(versionId: number, version: RedmineTS.Versions.UpdateParams): Promise<any> {
        return this.request('put', `versions/${versionId}`, { version })
    }

    /**
     * Deletes the version of given id.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Versions#DELETE
     * 
     * @param versionId 
     */
    public deleteProjectVersion(versionId: number): Promise<any> {
        return this.request('delete', `versions/${versionId}`)
    }


    // ==================== WIKI PAGES ====================

    /**
     * Returns the list of all pages in a project wiki.
     * https://www.redmine.org/projects/redmine/wiki/Rest_WikiPages#Getting-the-pages-list-of-a-wiki
     * 
     * @param projectId 
     */
    public listWikiPages(projectId: RedmineTS.Projects.ID): Promise<any> {
        return this.request('get', `projects/${projectId}/wiki/index`)
    }

    /**
     * Returns the details of a wiki page.
     * If version param is passed, returns the details of an old version of a wiki page.
     * https://www.redmine.org/projects/redmine/wiki/Rest_WikiPages#Getting-a-wiki-page
     * 
     * @param projectId 
     * @param pageTitle 
     * @param params 
     * @param version 
     */
    public getWikiPage(projectId: RedmineTS.Projects.ID, pageTitle: string, params?: RedmineTS.WikiPages.GetParams, version?: number): Promise<any> {
        return this.request('get', `projects/${projectId}/wiki/${pageTitle}${version ? "/" + version : ''}`, { params })
    }

    /**
     * Creates or updates a wiki page.
     * 
     * When creating or updating wiki pages, the text field must be provided.
     * If you do not wish to change the text, you can keep it by first getting
     * the wiki page, and provide the current text in the update.
     * 
     * When updating an existing page, you can include a version attribute to
     * make sure that the page is a specific version when you try to update it.
     * (eg. you don't want to overwrite an update that would have been done after you retrieved the page).

     * https://www.redmine.org/projects/redmine/wiki/Rest_WikiPages#Creating-or-updating-a-wiki-page

     * @param projectId 
     * @param pageTitle 
     * @param wikiPages 
     */
    public createUpdateWikiPage(projectId: RedmineTS.Projects.ID, pageTitle: string, wikiPages: RedmineTS.WikiPages.CreateUpdateParams): Promise<any> {
        return this.request('put', `projects/${projectId}/wiki/${pageTitle}`, {
            wiki_page: wikiPages
        })
    }

    /**
     * Deletes a wiki page, its attachments and its history. If the deleted page is a
     * parent page,its child pages are not deleted but changed as root pages.
     * https://www.redmine.org/projects/redmine/wiki/Rest_WikiPages#Deleting-a-wiki-page
     * 
     * @param projectId 
     * @param pageTitle 
     */
    public deleteWikiPage(projectId: RedmineTS.Projects.ID, pageTitle: string): Promise<any> {
        return this.request('delete', `projects/${projectId}/wiki/${pageTitle}`)
    }


    // ==================== QUERIES ====================

    /**
     * Returns the list of all custom queries visible by the user (public and private queries) for all projects.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Queries
     */
    public listQueries(): Promise<any> {
        return this.request('get', 'queries')
    }


    // ==================== ATTACHMENTS ====================

    /**
     * Upload file to Redmine's server If the upload succeeds, you get
     * a 201 response that contains a token for your uploaded file.
     * https://www.redmine.org/projects/redmine/wiki/Rest_api#Attaching-files
     * 
     * @param fileContent File content
     */
    public uploadFile(fileContent: Buffer): Promise<any> {
        return this.request('post', 'uploads', fileContent)
    }

    /**
     * Returns the description of the attachment of given id. The file can actually 
     * be downloaded at the URL given by the content_url attribute in the response.
     * Then you can use this token to attach your uploaded file to a new or an 
     * existing issue or other resource (eg. news, wiki pages etc.)
     * https://www.redmine.org/projects/redmine/wiki/Rest_Attachments#attachmentsidformat
     * 
     * @param attachmentId 
     */
    public getAttachment(attachmentId: number): Promise<any> {
        return this.request('get', `attachments/${attachmentId}`)
    }

    /**
     * Update attachment info (only filename and description can be changed)
     * 
     * IMPORTANT NOTE: Changing filename may cause the image file to
     * no longer appear on news pages, wikis, etc., when an image
     * token ("!filename.png!") is used in the content.
     * 
     * @param attachmentId 
     * @param attachment 
     */
    public updateAttachmentInfo(attachmentId: number, attachment: RedmineTS.Attachments.UpdateParams): Promise<any> {
        return this.request('put', `attachments/${attachmentId}`, { attachment })
    }

    /**
     * Delete an attachement
     * 
     * IMPORTANT NOTE: Deleting attachement may cause the image file to
     * no longer appear on news pages, wikis, etc., when an image
     * token ("!filename.png!") is used in the content.
     * 
     * https://www.redmine.org/projects/redmine/wiki/Rest_Attachments#DELETE
     * 
     * @param attachmentId 
     */
    public deleteAttachment(attachmentId: number): Promise<any> {
        return this.request('delete', `attachments/${attachmentId}`)
    }


    // ==================== ISSUE STATUSES ====================

    /**
     * Returns the list of all issue statuses.
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueStatuses
     */
    public listIssueStatuses(): Promise<any> {
        return this.request('get', `issue_statuses`)
    }


    // ==================== TRACKERS ====================

    /**
     * Returns the list of all trackers.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Trackers
     */
    public listTrackers(): Promise<any> {
        return this.request('get', `trackers`)
    }


    // ==================== ENUMERATIONS ====================

    /**
     * Returns the list of issue priorities.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Enumerations#enumerationsissue_prioritiesformat
     */
    public listIssuePrioritiesEnum(): Promise<any> {
        return this.request('get', `enumerations/issue_priorities`)
    }

    /**
     * Returns the list of time entry activities.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Enumerations#enumerationstime_entry_activitiesformat
     */
    public listTimeEntryActivitiesEnum(): Promise<any> {
        return this.request('get', `enumerations/time_entry_activities`)
    }

    /**
     * Returns the list of document categories.
     * https://www.redmine.org/projects/redmine/wiki/Rest_Enumerations#enumerationsdocument_categoriesformat
     */
    public listDocumentCategoriesEnum(): Promise<any> {
        return this.request('get', `enumerations/document_categories`)
    }


    // ==================== ISSUE CATEGORIES ====================

    /**
     * Returns the issue categories available for the project of given id or identifier.
     * @param projectId 
     */
    public listIssueCategories(projectId: RedmineTS.Projects.ID): Promise<any> {
        return this.request('get', `projects/${projectId}/issue_categories`)
    }
    
    /**
     * Creates an issue category for the project of given id or identifier
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueCategories#POST
     * 
     * @param projectId 
     * @param issueCategory 
     */
    public createIssueCategory(projectId: RedmineTS.Projects.ID, issueCategory: RedmineTS.IssueCategories.CreateParams): Promise<any> {
        return this.request('post', `projects/${projectId}/issue_categories`, {
            issue_category: issueCategory
        })
    }

    /**
     * Returns the issue category of given id
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueCategories#GET-2
     * 
     * @param issueCategoryId 
     */
    public getIssueCategory(issueCategoryId: number): Promise<any> {
        return this.request('get', `issue_categories/${issueCategoryId}`)
    }

    /**
     * Updates the issue category of given id
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueCategories#PUT
     * 
     * @param issueCategoryId 
     * @param issueCategory 
     */
    public updateIssueCategory(issueCategoryId: number, issueCategory: RedmineTS.IssueCategories.UpdateParams): Promise<any> {
        return this.request('put', `issue_categories/${issueCategoryId}`, {
            issue_category: issueCategory
        })
    }

    /**
     * Deletes the issue category of given id
     * https://www.redmine.org/projects/redmine/wiki/Rest_IssueCategories#DELETE
     * 
     * @param issueCategoryId 
     */
    public deleteIssueCategory(issueCategoryId: number): Promise<any> {
        return this.request('delete', `issue_categories/${issueCategoryId}`)
    }


    // ==================== ROLES ====================

    /**
     * Returns the list of roles
     * https://www.redmine.org/projects/redmine/wiki/Rest_Roles#rolesformat
     */
    public listRoles(): Promise<any> {
        return this.request('get', `roles`)
    }

    /**
     * Returns the list of permissions for a given role
     * https://www.redmine.org/projects/redmine/wiki/Rest_Roles#GET-2
     * 
     * @param roleId 
     */
    public listRolePermissions(roleId: number): Promise<any> {
        return this.request('get', `roles/${roleId}`)
    }


    // ==================== GROUPS ====================

    /**
     * Returns the list of groups. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#GET
     */
    public listGroups(): Promise<any> {
        return this.request('get', 'groups')
    }

    /**
     * Creates a group. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#POST
     * 
     * @param group 
     */
    public createGroup(group: RedmineTS.Groups.CreateParams): Promise<any> {
        return this.request('post', 'groups', { group })
    }

    /**
     * Returns details of a group. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#GET-2
     * 
     * @param groupId 
     * @param params 
     */
    public getGroup(groupId: number, params?: RedmineTS.Groups.GetParams): Promise<any> {
        return this.request('get', `groups/${groupId}`, { params })
    }

    /**
     * Updates an existing group. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#PUT
     * 
     * @param groupId 
     * @param group 
     */
    public updateGroup(groupId: number, group: RedmineTS.Groups.UpdateParams): Promise<any> {
        return this.request('put', `groups/${groupId}`, { group })
    }

    /**
     * Deletes an existing group. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#DELETE
     * 
     * @param groupId 
     */
    public deleteGroup(groupId: number): Promise<any> {
        return this.request('delete', `groups/${groupId}`)
    }

    /**
     * Adds an existing user to a group. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#POST-2
     * 
     * @param userId 
     * @param groupId 
     */
    public addUserToGroup(userId: number, groupId: number): Promise<any> {
        return this.request('post', `groups/${groupId}/users`, {
            user_id: userId
        })
    }

    /**
     * Removes a user from a group. This endpoint requires admin privileges
     * https://www.redmine.org/projects/redmine/wiki/Rest_Groups#DELETE-2
     * 
     * @param userId 
     * @param groupId 
     */
    public removeUserFromGroup(userId: number, groupId: number): Promise<any> {
        return this.request('delete', `groups/${groupId}/users/${userId}`)
    }


    // ==================== CUSTOM FIELDS ====================

    /**
     * Returns all the custom fields definitions
     * https://www.redmine.org/projects/redmine/wiki/Rest_CustomFields#custom_fieldsformat
     */
    public listCustomFields(): Promise<any> {
        return this.request('get', 'custom_fields')
    }


    // ==================== SEARCH ====================

    /**
     * Search in Redmine (Not documented yet - details in https://www.redmine.org/issues/6277)
     * https://www.redmine.org/projects/redmine/wiki/Rest_Search
     * 
     * @param q 
     * @param additionalParams 
     */
    public search(q: string, additionalParams?: RedmineTS.Search.Params): Promise<any> {
        return this.request('get', 'search', { 
            params: {
                q,
                ...additionalParams
            }
        })
    }


    // ==================== FILES ====================

    /**
     * Returns the files available for the project of given id or identifier
     * https://www.redmine.org/projects/redmine/wiki/Rest_Files#GET
     * 
     * @param projectId 
     */
    public listProjectFiles(projectId: RedmineTS.Projects.ID): Promise<any> {
        return this.request('get', `projects/${projectId}/files`)
    }

    /**
     * Upload a file for the project of given id or identifier
     * https://www.redmine.org/projects/redmine/wiki/Rest_Files#POST
     * 
     * @param projectId 
     * @param file 
     */
    public addProjectFile(projectId: RedmineTS.Projects.ID, file: RedmineTS.Files.AddProjectarams): Promise<any> {
        return this.request('post', `projects/${projectId}/files`, { file })
    }


    // ==================== MY ACCOUNT ====================

    /**
     * Returns the details of your account.
     * https://www.redmine.org/projects/redmine/wiki/Rest_MyAccount#GET
     */
    public getMyAccount(): Promise<any> {
        return this.request('get', 'my/account')
    }

    public updateMyAccount(user: RedmineTS.MyAccount.UpdateParams): Promise<any> {
        return this.request('put', 'my/account', { user })
    }

}


export namespace RedmineTS {

  export type Config = {
    apiKey?: string;
    username?: string;
    password?: string;
    maxUploadSize?: number;     // Default: 5MB
  }


  // ==================== COMMON NAMESPACE ====================

  export namespace Common {

    export type EnabledModuleNames =  'boards' | 'calendar' | 'documents' | 'files' | 'gantt' | 'issue_tracking' | 'news' | 'repository' | 'time_tracking' | 'wiki';

    export type CustomField = {
      id: number;
      value: string;
    }

    export type Upload = {
      token: string;
      filename: string;
      content_type: string;
      description?: string;
    }

    export type PaginationParams = {
      limit?: number;
      offset?: number;
    }

  }


  // ==================== PROJECT NAMESPACE ====================
  // https://www.redmine.org/projects/redmine/wiki/Rest_Projects

  export namespace Projects {

    export type ID = number | string;

    export type OptionalParams = {
      description?: string;
      homepage?: string;
      is_public?: boolean;
      parent_id?: number;
      inherit_members?: boolean;
      tracker_ids?: number[];
      enabled_module_names?: Common.EnabledModuleNames[];
      issue_custom_field_ids?: number[];
    }

    export type CreateParams = OptionalParams & {
      name: string;
      identifier: string;
    };
    
    export type UpdateParams = OptionalParams & {
      name?: string;
    };

    export type ListParamsInclude = 'trackers' | 'issue_categories' |'enabled_modules';

    export type ListParams = Common.PaginationParams & {
      include?: ListParamsInclude[];
    }
  
    export type GetParamsInclude = ListParamsInclude | 'time_entry_activities';

    export type GetParams = {
      include?: GetParamsInclude[];
    }
  }


  // ==================== ISSUES NAMESPACE ====================
  // https://www.redmine.org/projects/redmine/wiki/Rest_Issues

  export namespace Issues {

    export type OptionalParams = {
      tracker_id?: number;
      status_id?: number;
      priority_id?: number;
      description?: string;
      category_id?: number;
      fixed_version_id?: number;
      assigned_to_id?: number;
      parent_issue_id?: number;
      custom_fields?: Common.CustomField[];
      watcher_user_ids?: number[];
      is_private?: boolean;
      estimated_hours?: number;
      uploads?: Common.Upload[];
      done_ratio?: number;
      start_date?: string;
      due_date?: string;
    }

    export type CreateParams = OptionalParams & {
      subject: string;
      project_id: number;
    }
    
    export type UpdateParams = OptionalParams & {
      subject?: string;
      project_id?: number;
      notes?: string;
      private_notes?: boolean;
    }

    export type ListParamsInclude = 'attachments' | 'relations';
  
    export type ListParams = Common.PaginationParams & {
      sort?: string;
      include?: ListParamsInclude[];
    
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
    
    export type GetParamsInclude = ListParamsInclude | 'children' | 'changesets' | 'journals' | 'watchers';

    export type GetParams = {
      include?: GetParamsInclude[]
    }
  }


  // ==================== MEMBERSHIPS NAMESPACE ====================
  // https://www.redmine.org/projects/redmine/wiki/Rest_Memberships

  export namespace Memberships {

    export type AddParams = {
      user_id: number;
      role_ids: number[];
    }

    export type UpdateParams = {
      role_ids: number[];
    }

    export type ListProjectMembersParams = Common.PaginationParams;

  }


  // ==================== USERS NAMESPACE====================
  // https://www.redmine.org/projects/redmine/wiki/Rest_Users

  export namespace Users {

    export type MailNotificationOptions = 'all' | 'selected' | 'only_my_events' | 'only_assigned' | 'only_owner' | 'none';

    /* TODO
      - Verify if all attributes should/can be changed during update!
      - Can password be reseted by API? 
        https://www.redmine.org/boards/2/topics/54718
        https://www.redmine.org/projects/redmine/wiki/Rest_Users#PUT
        https://www.redmine.org/projects/redmine/repository/entry/branches/4.1-stable/app/controllers/users_controller.rb#L147
      */
    export type OptionalParams = {
      auth_source_id?: number;
      mail_notification?: MailNotificationOptions;
      must_change_passwd?: boolean;
      generate_password?: boolean;
      admin?: boolean;
      status?: number;
    }

    export type ListParams = Common.PaginationParams & {
      status?: 0 | 1 | 2 | 3,
      name?: string;
      group_id?: number;
    }

    export type CreateParams = OptionalParams & {
      login: string;
      password: string;
      firstname: string;
      lastname: string;
      mail: string;
    }

    export type GetParamsInclude = 'memberships' | 'groups';

    export type GetParams = {
      include?: GetParamsInclude[];
    }
    
    export type UpdateParams = OptionalParams & {
      login?: string;
      firstname?: string;
      lastname?: string;
      mail?: string;
    }
  }


  // ==================== TIME ENTRIES NAMESPACE ====================
  // https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries

  export namespace TimeEntries {

    export type ListParams = Common.PaginationParams & {
      user_id?: number;
      project_id?: number;
      spent_on?: string;
      from?: string;
      to?: string;
    }

    export type OptionalParams = {
      spent_on?: string;
      activity_id?: number;
      comments?: string;
      user_id?: number;
    }
    export type CreateParams = OptionalParams & {
      issue_id: number;
      project_id?: never;
    } | {
      issue_id?: never;
      project_id: number;
    } & {
      hours: number;
    }
    
    export type UpdateParams = OptionalParams & {
      project_id?: number;
      issue_id?: number;
      hours?: number;
    }

  }


  // ==================== NEWS NAMESPACE ====================
  // https://www.redmine.org/projects/redmine/wiki/Rest_News
  // or https://www.redmine.org/issues/13468

  export namespace News {

    export type ListParams = Common.PaginationParams;
  
    export type GetParamsInclude = 'attachments';

    export type GetParams = {
      include?: GetParamsInclude[];
    }
    
    export type OptionalCreateParams = {
      summary?: string;
      uploads?: Common.Upload[]
    }
    
    export type CreateParams = OptionalCreateParams & {
      title: string;
      description: string;
    }
    
    export type UpdateParams = OptionalCreateParams & {
      title?: string;
      description?: string;
    }

  }


  // ==================== ISSUES RELATIONS NAMESPACE ====================
  
  export namespace IssueRelations {
 
    export type RelationType = 'relates' | 'duplicates' | 'duplicated' | 'blocks' | 'blocked' | 'precedes' | 'follows' | 'copied_to' | 'copied_from';

    export type CreateParams = {
      issue_to_id: number;
      relation_type?: RelationType;
      delay?: number;
    }

  }
  
  
  // ==================== VERSIONS NAMESPACE ====================

  export namespace Versions {
  
    export type OptionalVersionParams = {
      status?: 'open' | 'locked' | 'closed';
      sharing?: 'none' | 'descendants' | 'hierarchy' | 'tree' | 'system';
      due_date?: string;
      description?: string;
      wiki_page_title?: string;
    }
    
    export type CreateParams = OptionalVersionParams & {
      name: string;
    }
    
    export type UpdateParams = OptionalVersionParams & {
      name?: string;
    }

  }
  

  // ==================== WIKI PAGES NAMESPACE ====================

  export namespace WikiPages {
  
    export type GetParams = {
      include?: 'attachments'
    }
    
    export type CreateUpdateParams = {
      text: string;
      comments?: string;
      version?: number;
      parent_id?: number;
      uploads?: Common.Upload[];
    }

  }
  
  
  // ==================== QUERIES NAMESPACE ====================

  //export namespace Queries {}
  
  // ==================== ATTACHMENTS NAMESPACE ====================
  
  export namespace Attachments {

    export type UpdateParams = {
      filename?: string;
      description?: string;
    }

  }

  
  // ==================== ISSUE STATUSES NAMESPACE ====================

  //export namespace IssueStatuses {}
  
  // ==================== TRACKERS NAMESPACE ====================

  //export namespace Trackers {}
  
  // ==================== ENUMERATIONS NAMESPACE ====================

  //export namespace Enumerations {}
  
  // ==================== ISSUE CATEGORIES NAMESPACE ====================

  export namespace IssueCategories {

    export type OptionalCreateParams = {
      assigned_to_id?: number;
    }
    
    export type CreateParams = OptionalCreateParams & {
      name: string;
    }
    
    export type UpdateParams = OptionalCreateParams & {
      name?: string;
    }

  }

  
  // ==================== ROLES NAMESPACE ====================

  //export namespace Roles {}
  
  // ==================== GROUPS NAMESPACE ====================
  
  export namespace Groups {

    export type CreateParams = {
      name: string;
      user_ids?: number[];
    }
    
    export type UpdateParams = {
      name?: string;
    }
    
    export type GetParamsInclude = 'users' | 'memberships';

    export type GetParams = {
      include?: GetParamsInclude[];
    }

  }
  
  
  // ==================== CUSTOM FIELDS NAMESPACE ====================

  //export namespace CustomFields {}
  
  // ==================== SEARCH NAMESPACE ====================

  export namespace Search {

    export type Params = Common.PaginationParams;

  }
  
  
  // ==================== FILES NAMESPACE ====================
  
  export namespace Files {

    export type AddProjectarams = {
      token: string;
      version_id?: number;
      filename?: string;
      description?: string;
    }

  }
  
  
  // ==================== MY ACCOUNT NAMESPACE ====================
  
  export namespace MyAccount {

    export type UpdateParams = {
      firstame?: string;
      lastname?: string;
      mail?: string;
    }

  }

}
