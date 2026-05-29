# Architecture

Tech-agent is designed as a cloud-first agent platform.

```txt
apps/web
  React client, login, workspace, API vault, workflows, plugins, downloads

cloud api
  auth, organizations, users, sessions, provider keys, policy checks

agent runtime
  planner, model router, tool bus, memory, artifact writer, approvals

workers
  browser automation, code execution, document generation, data analysis

sandbox
  isolated containers, network policies, file scopes, audit hooks

distribution
  website, GitHub releases, Windows installer, macOS DMG, Docker image
```

## Frontend

The current repository implements the public web client. It is intentionally backend-agnostic and uses a small API adapter in `src/lib/api.ts`.

## Backend

Recommended stack:

- API: FastAPI, NestJS, or Hono
- Database: PostgreSQL
- Queue: Redis or NATS
- Runtime isolation: Docker, Firecracker, or a managed sandbox provider
- Secrets: KMS-backed encrypted vault
- Observability: OpenTelemetry, structured logs, and run replay storage

## Agent Runtime

The runtime should treat each job as a durable run:

1. Normalize user intent.
2. Pick model and policy profile.
3. Create a plan.
4. Execute tools in a sandbox.
5. Ask for approval on sensitive actions.
6. Store artifacts and logs.
7. Return a final report.

## Desktop Clients

Desktop apps should be thin clients. They authenticate with the same cloud API and do not run the core agent locally.
