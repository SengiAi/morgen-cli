[Skip to Content](https://docs.morgen.so/calendars#nextra-skip-nav)

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

- [List calendars](https://docs.morgen.so/calendars#list-calendars)
- [Update calendar metadata](https://docs.morgen.so/calendars#update-calendar-metadata)

[Question? Give us feedback](https://github.com/morgen-so/morgen-dev-docs/issues/new?title=Feedback%20for%20%E2%80%9CCalendars%E2%80%9D&labels=feedback) [Edit this page](https://github.com/morgen-so/morgen-dev-docs/content/calendars.mdx) Scroll to top

Calendars

# Calendars

Each calendar account connected to Morgen can have multiple calendars.
Each calendar contains a list of events. Calendars contain fields
that describe the calendar itself, such as its name, color, and time zone.
The `id` field is the unique identifier of the calendar and is used,
together with an `accountId` to reference the calendar in other API methods
(e.g. to retrieve events).

## List calendars [Permalink for this section](https://docs.morgen.so/calendars\#list-calendars)

Returns a list of calendars over all connected calendar accounts.

```

fetch("https://api.morgen.so/v3/calendars/list", {
    method: "GET",
    headers: {
        "accept": "application/json",
        "Authorization": "ApiKey <API_KEY>"
    }
});
```

Morgen data model for calendars is modeled after the [JMAP specification](https://jmap.io/spec-calendars.html), with some differences.

Notice that the call will return all your calendars, aggregated over the connected calendar accounts.
Here is an example response:

```

{
  "data": {
    "calendars": [\
      {\
        "@type": "Calendar",\
        "id": "WyI2NDBhNjJjOWFhNWI3ZTA2Y2Y0MjQw...",\
        "accountId": "640a62c9aa5b7e06cf4240f8",\
        "integrationId": "o365",\
        "name": "Calendar", // the original name from the provider (if available)\
        "color": "#88baf8", // the original color from the provider (if available)\
        "sortOrder": 0, // the calendar order within the account\
        "myRights": {\
          "mayReadFreeBusy": true,\
          "mayReadItems": true,\
          "mayWriteAll": true,\
          "mayWriteOwn": true,\
          "mayUpdatePrivate": true,\
          "mayRSVP": true,\
          "mayAdmin": true,\
          "mayDelete": true\
        },\
        "defaultAlertsWithTime":{\
          "MzBfZGlzcGxheV90aW1lX2FuY29uYS5tcmNAZ21haWwuY29t":{\
            "@type":"Alert",\
            "trigger": {\
              "@type": "OffsetTrigger",\
              "offset":"-PT30M"\
            },\
            "action":"display"\
          }\
        },\
        "defaultAlertsWithoutTime":{\
          "MzBfZGlzcGxheV90aW1lX2FuY29uYS5tcmNAZ21haWwuY29t":{\
            "@type":"Alert",\
            "trigger": {\
              "@type": "OffsetTrigger",\
              "offset":"-P1D"\
            },\
            "action":"display"\
          }\
        },\
        // Morgen-specific fields\
        "morgen.so:metadata": {\
          "busy": true, // whether the calendar is considered for availability\
          "overrideColor": "#ff0000", // color set from Morgen desktop\
          "overrideName": "Morgen Calendar" // name set from Morgen desktop\
        }\
      },\
     ...\
    ]
  }
}

```

## Update calendar metadata [Permalink for this section](https://docs.morgen.so/calendars\#update-calendar-metadata)

At the moment, only the Morgen-specific metadata of a calendar can be updated.
There is no API available to update the calendar information directly on the remote calendar provider.

```

fetch("https://api.morgen.so/v3/calendars/update", {
    method: "POST",
    headers: {
        "accept": "application/json",
        "Authorization": "ApiKey <API_KEY>"
    },
    body: JSON.stringify(<CALENDAR_UPDATE>)
});
```

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | Body | - | Yes | The ID of the calendar to update. |
| `accountId` | Body | - | Yes | The ID of the account the calendar belongs to. |
| `morgen.so:metadata` | Body | - | Yes | An object with the metadata to update. The object can only contain the fields `busy`, `overrideColor` and/or `overrideName`. |

Last updated onJanuary 9, 2026

[Integrations](https://docs.morgen.so/integrations "Integrations") [Events](https://docs.morgen.so/events "Events")

* * *

Morgen Developer Documentation - Morgen AG © 2020 - 2026 All rights reserved.