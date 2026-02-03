[Skip to Content](https://docs.morgen.so/rate-limits#nextra-skip-nav)

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

- [Rate Limit Values](https://docs.morgen.so/rate-limits#rate-limit-values)
- [Points System (API Key)](https://docs.morgen.so/rate-limits#points-system-api-key)
- [Rate Limit Headers](https://docs.morgen.so/rate-limits#rate-limit-headers)
- [Example Headers](https://docs.morgen.so/rate-limits#example-headers)
- [Handling Rate Limits](https://docs.morgen.so/rate-limits#handling-rate-limits)
- [Best Practices](https://docs.morgen.so/rate-limits#best-practices)

[Question? Give us feedback](https://github.com/morgen-so/morgen-dev-docs/issues/new?title=Feedback%20for%20%E2%80%9CRate%20Limits%E2%80%9D&labels=feedback) [Edit this page](https://github.com/morgen-so/morgen-dev-docs/content/rate-limits.mdx) Scroll to top

Rate Limits

# Rate Limits

The Morgen API enforces rate limits to ensure fair usage and system stability. Rate limits are applied per user.

## Rate Limit Values [Permalink for this section](https://docs.morgen.so/rate-limits\#rate-limit-values)

| Authentication | Limit | Window |
| --- | --- | --- |
| API Key | 100 points | 15 minutes |

## Points System (API Key) [Permalink for this section](https://docs.morgen.so/rate-limits\#points-system-api-key)

When using API Key authentication, requests consume points based on the endpoint:

| Endpoint | Points Cost |
| --- | --- |
| `/list` endpoints | 10 points |
| All other endpoints | 1 point |

## Rate Limit Headers [Permalink for this section](https://docs.morgen.so/rate-limits\#rate-limit-headers)

Every API response includes headers to help you track your rate limit usage. These headers follow the [IETF draft standard](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/).

| Header | Description |
| --- | --- |
| `RateLimit-Limit` | Maximum points/requests allowed in the current window |
| `RateLimit-Remaining` | Points/requests remaining in the current window |
| `RateLimit-Reset` | Seconds until the rate limit window resets |
| `Retry-After` | Seconds to wait before retrying (only present when `RateLimit-Remaining` is 0) |

### Example Headers [Permalink for this section](https://docs.morgen.so/rate-limits\#example-headers)

```

RateLimit-Limit: 100
RateLimit-Remaining: 90
RateLimit-Reset: 459
```

## Handling Rate Limits [Permalink for this section](https://docs.morgen.so/rate-limits\#handling-rate-limits)

When you exceed the rate limit, the API returns a `429 Too Many Requests` response. The response includes a `Retry-After` header indicating how long to wait before retrying.

### Best Practices [Permalink for this section](https://docs.morgen.so/rate-limits\#best-practices)

- Monitor the `RateLimit-Remaining` header to avoid hitting limits
- Implement exponential backoff when receiving 429 responses
- Use `updatedAfter` filters to sync only recently changed resources
- Cache responses where appropriate to reduce API calls

Last updated onJanuary 9, 2026

[Authentication](https://docs.morgen.so/authentication "Authentication") [Integrations](https://docs.morgen.so/integrations "Integrations")

* * *

Morgen Developer Documentation - Morgen AG © 2020 - 2026 All rights reserved.