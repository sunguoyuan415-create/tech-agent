# Tech-agent API Service

This is the Batch 2 backend service for local and cloud deployments.

## Run

```bash
npm run dev:api
```

Default URL:

```txt
http://localhost:8787
```

## Implemented Endpoints

- `GET /health`
- `POST /auth/send-code`
- `POST /auth/verify-code`
- `POST /auth/login`
- `GET /auth/session`
- `GET /providers`
- `POST /providers`
- `POST /agent/runs`
- `GET /agent/runs/:id/events`
- `GET /marketplace/plugins`

The current service uses in-memory stores so it is easy to run immediately. Production should replace these stores with PostgreSQL, Redis, KMS-backed secret storage, and a durable queue.
