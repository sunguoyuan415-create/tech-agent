# Security

Tech-agent can call models, browse websites, run code, and publish artifacts, so production deployments need strict guardrails.

## Required Controls

- HTTPS only
- Encrypted provider keys
- Workspace-scoped file access
- Sandboxed tool execution
- Audit logs for auth, keys, plugin changes, approvals, and releases
- Human approval for destructive or financial actions
- Rate limits per user, org, provider, and tool
- Plugin permission manifests
- Secrets redaction in logs

## High-risk Tool Calls

Require approval for:

- Sending email
- Creating or deleting repositories
- Making purchases
- Publishing releases
- Accessing private files
- Calling custom enterprise APIs
- Running shell commands with network access

## Reporting

Open a private security advisory on GitHub or email the project maintainers listed in the repository profile.
