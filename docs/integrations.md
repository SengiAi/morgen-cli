[Skip to Content](https://docs.morgen.so/integrations#nextra-skip-nav)

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

- [Supported services](https://docs.morgen.so/integrations#supported-services)
- [Calendars](https://docs.morgen.so/integrations#calendars)
- [Video Conferencing](https://docs.morgen.so/integrations#video-conferencing)
- [How to connect an account](https://docs.morgen.so/integrations#how-to-connect-an-account)
- [How to disconnect an account](https://docs.morgen.so/integrations#how-to-disconnect-an-account)
- [How to list the connected accounts of a user](https://docs.morgen.so/integrations#how-to-list-the-connected-accounts-of-a-user)
- [How to list the available providers](https://docs.morgen.so/integrations#how-to-list-the-available-providers)

[Question? Give us feedback](https://github.com/morgen-so/morgen-dev-docs/issues/new?title=Feedback%20for%20%E2%80%9CIntegrations%E2%80%9D&labels=feedback) [Edit this page](https://github.com/morgen-so/morgen-dev-docs/content/integrations.mdx) Scroll to top

Integrations

# Integrations

The `integrations` API allows you to connect Morgen to third-party services (e.g. Google Calendar or Todoist)
and manage accounts that are already connected.

## Supported services [Permalink for this section](https://docs.morgen.so/integrations\#supported-services)

The Morgen Sync service currently supports the following services:

### Calendars [Permalink for this section](https://docs.morgen.so/integrations\#calendars)

| Provider Name | Integration Id | Contact directory |
| --- | --- | --- |
| Google Calendar | `google` | ✅ |
| Office 365 (Graph API) | `o365` | ✅ |
| iCloud | `icloud` |  |
| Fastmail | `fastmail` |  |
| CalDAV | `caldav` |  |
| Calendar feed | `feed` |  |

## Video Conferencing [Permalink for this section](https://docs.morgen.so/integrations\#video-conferencing)

Note that `Google Meet` and `Microsoft Teams` are available as part of the Google Calendar and Office 365 integrations respectively.
The following services can be connected separately and used with any calendar.

| Provider Name | Integration Id |
| --- | --- |
| Zoom | `zoom` |
| Webex | `webex` |

## How to connect an account [Permalink for this section](https://docs.morgen.so/integrations\#how-to-connect-an-account)

👉

Please connect your third-party tools using the Morgen desktop app, or from
[https://platform.morgen.so](https://platform.morgen.so/).

## How to disconnect an account [Permalink for this section](https://docs.morgen.so/integrations\#how-to-disconnect-an-account)

👉

You can disconnect an account from the Morgen desktop app, or from
[https://platform.morgen.so](https://platform.morgen.so/).

## How to list the connected accounts of a user [Permalink for this section](https://docs.morgen.so/integrations\#how-to-list-the-connected-accounts-of-a-user)

To list the connected accounts of a user, issue an authorized GET request as follows:

```

fetch("https://api.morgen.so/v3/integrations/accounts/list", {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "ApiKey <API_KEY>",
  },
});
```

Here is an example response:

```

{
  "data": {
    "accounts": [\
      {\
        "id": "640a62c9aa5b7e06cf400000",\
        "providerId": "87ee97f6-470f-426a-9b73-xxxxxxxxxx",\
        "userId": "6010a263f9a7f30012200000",\
        "clientId": "morgen",\
        "providerUserId": "example@morgen.so",\
        "providerUserDisplayName": "John Doe",\
        "integrationId": "o365",\
        "auth": {\
          "mechanism": "oauth",\
          "refreshTokenUpdatedAt": "2023-03-09T22:50:49.838Z",\
          "accessTokenUpdatedAt": "2023-03-13T12:50:00.957Z"\
        },\
        "lastCheckedAt": "2023-03-13T12:50:01.371Z",\
        "lastCheckedError": null,\
        "requiresAuthentication": null,\
        "createdAt": "2023-03-09T22:50:49.842Z",\
        "updatedAt": "2023-03-13T12:50:01.372Z",\
        "shouldReconnect": false,\
        "shouldReconnectReason": null,\
        // The following fields are used internally by Morgen,\
        // as we are refactoring part of our integrations to a new sync service.\
        // You can ignore them.\
        "isConnectedSync": true,\
        "isConnectedLegacy": false,\
        "canMigrateToSync": false,\
        "supersededByAccountId": null\
      }\
    ]
  }
}
```

## How to list the available providers [Permalink for this section](https://docs.morgen.so/integrations\#how-to-list-the-available-providers)

It is possible to obtain the list of available providers from the Morgen Sync service.
Use this route to fetch metadata about the providers, such as the name, the id, the service logo, and the supported features.

To list the available providers, issue an authorized GET request as follows:

```

fetch("https://api.morgen.so/v3/integrations/list", {
  method: "GET",
  headers: {
    accept: "application/json",
  },
});
```

Notice that this route does not require authentication.

Here is an example response:

```

{
  "data": {
    "integrations": [\
      {\
        "id": "o365",\
        "authId": "o365",\
        "groups": [\
          "calendars"\
        ],\
        "displayName": "Office 365",\
        "supportedAuthMethods": ["oauth"],\
        "iconData": "PHN2ZyBmaWxsPSJub25lIiB..."\
      }\
      ...\
    ],
    "groups": [\
      {\
        "displayName": "Video Conferencing",\
        "type": "video"\
      },\
      {\
        "displayName": "Tasks",\
        "type": "tasks"\
      },\
      {\
        "displayName": "Calendars",\
        "type": "calendars"\
      },\
      {\
        "displayName": "Automation",\
        "type": "automation"\
      }\
    ]
  }
}
```

Last updated onJanuary 9, 2026

[Rate Limits](https://docs.morgen.so/rate-limits "Rate Limits") [Calendars](https://docs.morgen.so/calendars "Calendars")

* * *

Morgen Developer Documentation - Morgen AG © 2020 - 2026 All rights reserved.