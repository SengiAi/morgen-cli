[Skip to Content](https://docs.morgen.so/events-rsvp-draft#nextra-skip-nav)

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

- [RSVP to an event](https://docs.morgen.so/events-rsvp-draft#rsvp-to-an-event)

[Question? Give us feedback](https://github.com/morgen-so/morgen-dev-docs/issues/new?title=Feedback%20for%20%E2%80%9CEvents%20Rsvp%20Draft%E2%80%9D&labels=feedback) [Edit this page](https://github.com/morgen-so/morgen-dev-docs/content/events-rsvp-draft.mdx) Scroll to top

Events RSVP

This is not supported by the backend yet, but it was not available before either.

## RSVP to an event [Permalink for this section](https://docs.morgen.so/events-rsvp-draft\#rsvp-to-an-event)

An event can be accepted, declined or tentatively accepted by the user.
This is done by sending a POST request to the following endpoints:

```

fetch("https://sync.morgen.so/v1/events/<RSVP_ACTION>?seriesUpdateMode=<UPDATE_MODE>", {
    method: "POST",
    headers: {
        "accept": "application/json",
        "Authorization": "ApiKey <API_KEY>"
    },
    body: JSON.stringify({"id": <EVENT_ID>, "comment": <COMMENT>, "notifyOrganizer": <true|false>})
});
```

The last segment of the URL marked with `<RSVP_ACTION>` defines the action to be performed.
Possible values are:

- `accept`: Accept the event.
- `decline`: Decline the event.
- `tentativelyAccept`: Tentatively accept the event.

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `seriesUpdateMode` | Query | `single` | No | Defines how to update recurring events. Possible values are: `all` (update all events), `future` (update this and future occurrences), `single` (update this event only, default). This parameter has no effect on non-recurring events. |
| `id` | Body | - | Yes | The ID of the event to update. |
| `comment` | Body | - | No | A comment to be sent to the organizer. |
| `notifyOrganizer` | Body | `true` | No | Whether to send the response to the organizer. |

⚠️

Currently `seriesUpdateMode` only supports the default value (`single`).

Last updated onJanuary 9, 2026

[Changelog](https://docs.morgen.so/changelog "Changelog")

* * *

Morgen Developer Documentation - Morgen AG © 2020 - 2026 All rights reserved.