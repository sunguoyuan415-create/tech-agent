# Contributing

Thanks for helping build Tech-agent.

## Local Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run lint
npm run build
```

## Pull Request Rules

- Keep UI changes responsive on desktop and mobile.
- Do not commit real API keys.
- Add docs when changing API contracts.
- Keep agent tool permissions explicit.
- Prefer small, reviewable pull requests.

## Project Direction

Tech-agent is cloud-first. Desktop clients are thin clients, and the cloud runtime owns complex execution.
