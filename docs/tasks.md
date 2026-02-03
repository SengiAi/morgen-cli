[Skip to Content](https://docs.morgen.so/tasks#nextra-skip-nav)

[Morgen Developer Documentation](https://docs.morgen.so/)

`CTRL K`

`CTRL K`

- [Introduction](https://docs.morgen.so/)
- Morgen API
- [Introduction](https://docs.morgen.so/introduction)
- [Authentication](https://docs.morgen.so/authentication)
- [Rate Limits](https://docs.morgen.so/rate-limits)
- [Integrations](https://docs.morgen.so/integrations)
- [Calendars](https://docs.morgen.so/calendars)
- [Events](https://docs.morgen.so/events)
- [Tasks](https://docs.morgen.so/tasks)
- * * *

- [Changelog](https://docs.morgen.so/changelog)

System

- [Introduction](https://docs.morgen.so/)
- Morgen API
- [Introduction](https://docs.morgen.so/introduction)
- [Authentication](https://docs.morgen.so/authentication)
- [Rate Limits](https://docs.morgen.so/rate-limits)
- [Integrations](https://docs.morgen.so/integrations)
- [Calendars](https://docs.morgen.so/calendars)
- [Events](https://docs.morgen.so/events)
- [Tasks](https://docs.morgen.so/tasks)
- * * *

- [Changelog](https://docs.morgen.so/changelog)

System

On This Page

- [List tasks](https://docs.morgen.so/tasks#list-tasks)
- [Task schema](https://docs.morgen.so/tasks#task-schema)
- [Task Fields Reference](https://docs.morgen.so/tasks#task-fields-reference)
- [Get a task](https://docs.morgen.so/tasks#get-a-task)
- [Response](https://docs.morgen.so/tasks#response)
- [Create a task](https://docs.morgen.so/tasks#create-a-task)
- [Request Body Fields](https://docs.morgen.so/tasks#request-body-fields)
- [Response](https://docs.morgen.so/tasks#response-1)
- [Creating Subtasks](https://docs.morgen.so/tasks#creating-subtasks)
- [Update a task](https://docs.morgen.so/tasks#update-a-task)
- [Request Body Fields](https://docs.morgen.so/tasks#request-body-fields-1)
- [Response](https://docs.morgen.so/tasks#response-2)
- [Move a task](https://docs.morgen.so/tasks#move-a-task)
- [Request Body Fields](https://docs.morgen.so/tasks#request-body-fields-2)
- [Response](https://docs.morgen.so/tasks#response-3)
- [Delete a task](https://docs.morgen.so/tasks#delete-a-task)
- [Request Body Fields](https://docs.morgen.so/tasks#request-body-fields-3)
- [Response](https://docs.morgen.so/tasks#response-4)
- [Close a task](https://docs.morgen.so/tasks#close-a-task)
- [Request Body Fields](https://docs.morgen.so/tasks#request-body-fields-4)
- [Response](https://docs.morgen.so/tasks#response-5)
- [Reopen a task](https://docs.morgen.so/tasks#reopen-a-task)
- [Request Body Fields](https://docs.morgen.so/tasks#request-body-fields-5)
- [Response](https://docs.morgen.so/tasks#response-6)
- [Common Validation Errors](https://docs.morgen.so/tasks#common-validation-errors)
- [Invalid Due Date Format](https://docs.morgen.so/tasks#invalid-due-date-format)
- [Invalid Priority Value](https://docs.morgen.so/tasks#invalid-priority-value)
- [Missing Required Title](https://docs.morgen.so/tasks#missing-required-title)

[Question? Give us feedback](https://github.com/morgen-so/morgen-dev-docs/issues/new?title=Feedback%20for%20%E2%80%9C(Morgen)%20Tasks%E2%80%9D&labels=feedback) [Edit this page](https://github.com/morgen-so/morgen-dev-docs/content/tasks.mdx) Scroll to top

Tasks

# (Morgen) Tasks

Morgen allows you to manage tasks through a unified API. The following documentations explains how to operate
on first-party Morgen tasks.
Tasks follow a data model inspired by the [JSCalendar standard](https://datatracker.ietf.org/doc/rfc8984/).

## List tasks [Permalink for this section](https://docs.morgen.so/tasks\#list-tasks)

Returns a list of tasks, optionally filtered by update time.

```

fetch(
  "https://api.morgen.so/v3/tasks/list?limit=<LIMIT>&updatedAfter=<UPDATED_AFTER>",
  {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "ApiKey <API_KEY>",
    },
  }
);
```

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `limit` | Query | 100 | No | Maximum number of tasks to return (max 100). |
| `updatedAfter` | Query | - | No | Only return tasks updated/created after this ISO 8601 datetime. |

⚠️

The Tasks API is primarily designed for creating tasks in Morgen from
unsupported integrations using apps like Zapier. Listing tasks costs 10 points
per request. See [Rate Limits](https://docs.morgen.so/rate-limits) for details.

## Task schema [Permalink for this section](https://docs.morgen.so/tasks\#task-schema)

Here is an example response for the `/tasks/list` endpoint:

```

{
  "data": {
    "tasks": [\
      {\
        "@type": "Task",\
\
        // Morgen ID for task\
        "id": "WyJBUU1rQURaa1lXWXpOel...",\
\
        // Morgen ID for the account\
        "accountId": "640a62c9aa5b7e06cf420000",\
\
        "integrationId": "morgen",\
\
        // Task list this task belongs to\
        "taskListId": "default",\
\
        "created": "2023-02-28T11:50:57",\
        "updated": "2023-02-28T17:56:44",\
\
        "title": "Review quarterly report",\
        "description": "Review and provide feedback on Q4 report",\
        "descriptionContentType": "text/plain",\
\
        // Due date in LocalDateTime format\
        "due": "2023-03-15T17:00:00",\
        "timeZone": "Europe/Berlin",\
\
        // Estimated time to complete (ISO 8601 duration)\
        "estimatedDuration": "PT2H",\
\
        // Priority: 0 = undefined, 1 = highest, 9 = lowest\
        "priority": 1,\
\
        // Task completion status\
        "progress": "needs-action",\
\
        // Position within the task list (for ordering)\
        "position": 0,\
\
        // Relations to other tasks (for subtasks)\
        "relatedTo": {\
          "parent-task-id": {\
            "@type": "Relation",\
            "relation": { "parent": true }\
          }\
        },\
\
        // Morgen-specific derived fields (read-only)\
        "morgen.so:derived": {\
          "scheduled": true\
        }\
      }\
    ],
    // Label definitions for task metadata
    "labelDefs": [...],
    // Spaces/workspaces the tasks belong to
    "spaces": [...]
  }
}
```

### Task Fields Reference [Permalink for this section](https://docs.morgen.so/tasks\#task-fields-reference)

| Field | Type | Description |
| --- | --- | --- |
| `@type` | String | Always `"Task"` |
| `id` | String | Morgen’s unique identifier for the task |
| `accountId` | String | ID of the account the task belongs to |
| `integrationId` | String | Integration provider (`"morgen"`) |
| `taskListId` | String | ID of the task list containing this task |
| `title` | String | Task title/summary |
| `description` | String | Task description (plain text or HTML) |
| `descriptionContentType` | String | Either `"text/plain"` or `"text/html"` |
| `due` | String | Due date in LocalDateTime format (e.g., `"2023-03-15T17:00:00"`) |
| `timeZone` | String | IANA timezone for the due date |
| `estimatedDuration` | String | Estimated duration in ISO 8601 format (e.g., `"PT2H"`) |
| `priority` | Number | Priority level: 0 (undefined), 1 (highest) to 9 (lowest) |
| `progress` | String | Status: `"needs-action"`, `"in-process"`, `"completed"`, `"failed"`, `"cancelled"` |
| `position` | Number | Sort order within the task list |
| `relatedTo` | Object | Relations to other tasks (for subtask hierarchies) |
| `created` | String | Creation timestamp (UTC) |
| `updated` | String | Last update timestamp (UTC) |

⚠️

Additional fields might be added in the future. If you are storing tasks in
your database, please make sure to ignore unknown fields.

## Get a task [Permalink for this section](https://docs.morgen.so/tasks\#get-a-task)

Retrieve a single task by its ID.

```

fetch("https://api.morgen.so/v3/tasks?id=<TASK_ID>", {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
});
```

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | Query | - | Yes | The Morgen ID of the task to retrieve. |

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response)

```

{
  "data": {
    "task": {
      "@type": "Task",
      "id": "WyJBUU1rQURaa1lXWXpOel...",
      "title": "Review quarterly report",
      ...
    },
    "labelDefs": [...]
  }
}
```

## Create a task [Permalink for this section](https://docs.morgen.so/tasks\#create-a-task)

Create a new task in Morgen.

```

fetch("https://api.morgen.so/v3/tasks/create", {
  method: "POST",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
  body: JSON.stringify({
    title: "Review quarterly report",
    description: "Review and provide feedback",
    due: "2023-03-15T17:00:00",
    timeZone: "Europe/Berlin",
    priority: 1,
  }),
});
```

### Request Body Fields [Permalink for this section](https://docs.morgen.so/tasks\#request-body-fields)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | String | Yes | Task title (minimum 1 character). |
| `description` | String | No | Task description. |
| `descriptionContentType` | String | No | `"text/plain"` or `"text/html"`. Default: `"text/plain"`. |
| `due` | String | No | Due date in LocalDateTime format (exactly 19 characters: `YYYY-MM-DDTHH:mm:ss`). |
| `timeZone` | String | No | IANA timezone for the due date. |
| `estimatedDuration` | String | No | Estimated duration in ISO 8601 format. |
| `taskListId` | String | No | ID of the task list to add the task to. |
| `priority` | Number | No | Priority: 0 (undefined), 1 (highest) to 9 (lowest). |
| `progress` | String | No | Initial status: `"needs-action"` or `"completed"`. |
| `relatedTo` | Object | No | Relations for creating subtasks. |

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response-1)

```

{
  "data": {
    "id": "WyJBUU1rQURaa1lXWXpOel..."
  }
}
```

### Creating Subtasks [Permalink for this section](https://docs.morgen.so/tasks\#creating-subtasks)

To create a subtask, use the `relatedTo` field to specify the parent task:

```

{
  "title": "Subtask title",
  "relatedTo": {
    "<PARENT_TASK_ID>": {
      "@type": "Relation",
      "relation": { "parent": true }
    }
  }
}
```

## Update a task [Permalink for this section](https://docs.morgen.so/tasks\#update-a-task)

Update an existing task. Only include the fields you want to change.

```

fetch("https://api.morgen.so/v3/tasks/update", {
  method: "POST",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
  body: JSON.stringify({
    id: "<TASK_ID>",
    title: "Updated title",
  }),
});
```

### Request Body Fields [Permalink for this section](https://docs.morgen.so/tasks\#request-body-fields-1)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | String | Yes | The Morgen ID of the task to update. |
| `title` | String | No | Updated task title. |
| `description` | String | No | Updated description. |
| `due` | String | No | Updated due date. |
| `timeZone` | String | No | Updated timezone. |
| `taskListId` | String | No | Move task to a different task list. |
| `priority` | Number | No | Updated priority (0-9). |
| `progress` | String | No | Updated status. |
| `labels` | Array | No | Task labels. |

💡

Updates are patch updates. Only the fields you provide will be updated. All
other fields remain unchanged.

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response-2)

Returns HTTP 204 No Content on success.

## Move a task [Permalink for this section](https://docs.morgen.so/tasks\#move-a-task)

Reorder a task within its list or change its parent (for subtask hierarchies).

```

fetch("https://api.morgen.so/v3/tasks/move", {
  method: "POST",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
  body: JSON.stringify({
    id: "<TASK_ID>",
    previousId: "<PREVIOUS_TASK_ID>",
    parentId: "<PARENT_TASK_ID>",
  }),
});
```

### Request Body Fields [Permalink for this section](https://docs.morgen.so/tasks\#request-body-fields-2)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | String | Yes | The Morgen ID of the task to move. |
| `previousId` | String | No | ID of the task this should appear after. Use `null` to move to first position. |
| `parentId` | String | No | ID of the parent task. Use `null` to move to root level. |

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response-3)

Returns HTTP 204 No Content on success.

## Delete a task [Permalink for this section](https://docs.morgen.so/tasks\#delete-a-task)

Delete a task permanently.

```

fetch("https://api.morgen.so/v3/tasks/delete", {
  method: "POST",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
  body: JSON.stringify({
    id: "<TASK_ID>",
  }),
});
```

### Request Body Fields [Permalink for this section](https://docs.morgen.so/tasks\#request-body-fields-3)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | String | Yes | The Morgen ID of the task to delete. |

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response-4)

Returns HTTP 204 No Content on success.

## Close a task [Permalink for this section](https://docs.morgen.so/tasks\#close-a-task)

Mark a task as completed.

```

fetch("https://api.morgen.so/v3/tasks/close", {
  method: "POST",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
  body: JSON.stringify({
    id: "<TASK_ID>",
  }),
});
```

### Request Body Fields [Permalink for this section](https://docs.morgen.so/tasks\#request-body-fields-4)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | String | Yes | The Morgen ID of the task to close. |
| `occurrenceStart` | String | No | For recurring tasks: ISO 8601 datetime of the specific occurrence to close. |

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response-5)

Returns HTTP 204 No Content on success.

## Reopen a task [Permalink for this section](https://docs.morgen.so/tasks\#reopen-a-task)

Mark a completed task as not completed.

```

fetch("https://api.morgen.so/v3/tasks/reopen", {
  method: "POST",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
  body: JSON.stringify({
    id: "<TASK_ID>",
  }),
});
```

### Request Body Fields [Permalink for this section](https://docs.morgen.so/tasks\#request-body-fields-5)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | String | Yes | The Morgen ID of the task to reopen. |
| `occurrenceStart` | String | No | For recurring tasks: ISO 8601 datetime of the specific occurrence to reopen. |

### Response [Permalink for this section](https://docs.morgen.so/tasks\#response-6)

Returns HTTP 204 No Content on success.

## Common Validation Errors [Permalink for this section](https://docs.morgen.so/tasks\#common-validation-errors)

### Invalid Due Date Format [Permalink for this section](https://docs.morgen.so/tasks\#invalid-due-date-format)

**Error Message**:

```

due must be a valid ISO 8601 date string
```

**Cause**: The due date is not in the correct format.

**Solution**: Use exactly 19 characters in LocalDateTime format: `YYYY-MM-DDTHH:mm:ss`

**Example**: `"2023-03-15T17:00:00"` (not `"2023-03-15"` or `"2023-03-15T17:00:00Z"`)

* * *

### Invalid Priority Value [Permalink for this section](https://docs.morgen.so/tasks\#invalid-priority-value)

**Error Message**:

```

priority must not be greater than 9
priority must not be less than 0
```

**Cause**: Priority value is outside the valid range.

**Solution**: Use a value between 0 and 9, where 0 is undefined and 1 is highest priority.

* * *

### Missing Required Title [Permalink for this section](https://docs.morgen.so/tasks\#missing-required-title)

**Error Message**:

```

title must be longer than or equal to 1 characters
```

**Cause**: Task title is empty or missing.

**Solution**: Provide a title with at least 1 character when creating a task.

Last updated onJanuary 9, 2026

[Events](https://docs.morgen.so/events "Events") [Changelog](https://docs.morgen.so/changelog "Changelog")

* * *

Morgen Developer Documentation - Morgen AG © 2020 - 2026 All rights reserved.