# Tech-agent API Contract

The web app requires a backend through `VITE_API_BASE_URL`. The included Node and Vercel API endpoints send real email verification codes when `AUTH_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM` are configured.

## Authentication

### `POST /auth/login`

Request:

```json
{
  "email": "owner@tech-agent.dev",
  "password": "secret",
  "organization": "Tech-agent Cloud"
}
```

Response:

```json
{
  "user": "Owner",
  "email": "owner@tech-agent.dev",
  "org": "Tech-agent Cloud",
  "role": "Owner",
  "token": "jwt-or-session-token"
}
```

### `GET /auth/session`

Returns the authenticated account, organization, role, feature flags, and active workspace.

### `POST /auth/send-code`

Request:

```json
{
  "email": "owner@tech-agent.dev"
}
```

Response:

```json
{
  "email": "owner@tech-agent.dev",
  "sent": true,
  "expiresIn": 600,
  "verificationId": "signed-verification-token",
  "delivery": "email"
}
```

### `POST /auth/verify-code`

Request:

```json
{
  "email": "owner@tech-agent.dev",
  "organization": "Tech-agent Cloud",
  "code": "123456",
  "verificationId": "signed-verification-token"
}
```

Response mirrors `POST /auth/login`.

## Agent Runs

### `POST /agent/runs`

Request:

```json
{
  "prompt": "Build and deploy a website",
  "modelProvider": "openai",
  "apiKey": "optional-user-key",
  "workspaceId": "main"
}
```

Response:

```json
{
  "id": "run_123",
  "status": "queued",
  "message": "Run accepted"
}
```

### `GET /agent/runs/:id/events`

Streams or returns planning steps, tool calls, logs, artifacts, approvals, and final result.

### `POST /agent/runs/:id/approve`

Approves sensitive tool calls such as browser purchase flows, repository publishing, API writes, or file exports.

## Files

### `POST /files/upload`

Uploads files into a workspace-scoped cloud file store. The backend should return file IDs, MIME type, size, checksum, and preview URLs.

## Workflows

### `POST /workflows`

Creates a workflow definition with nodes, edges, schedules, tool permissions, and environment variables.

### `POST /workflows/:id/execute`

Runs a workflow immediately or schedules it through the worker queue.

## Security Requirements

- Use HTTPS only.
- Store provider keys encrypted at rest.
- Scope files by organization and workspace.
- Require approval for high-risk tool calls.
- Keep immutable audit logs for auth, secrets, plugin changes, and release publishing.
