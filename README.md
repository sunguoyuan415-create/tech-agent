# Tech-agent

Tech-agent is an open-source cloud agent workspace. It gives users a polished web app for login, API key routing, multi-agent work, tools, workflows, plugin management, admin controls, and public download surfaces for Windows and macOS clients.

This repository currently contains the production-ready web application shell and deployment configuration. The web app can be deployed publicly today, and it is designed to connect to a real cloud backend through `VITE_API_BASE_URL`.

## What is included

- Advanced React + TypeScript web workspace
- Login screen with API server connection
- Email verification login flow
- Node API service under `services/api`
- Model API vault for OpenAI, Anthropic, Gemini, DeepSeek, and custom gateways
- Multi-agent console for Builder, Researcher, Operator, and Analyst roles
- Cloud runtime dashboard, task timeline, artifact panel, and tool permission UI
- Workflow studio, plugin marketplace, downloads page, admin dashboard, and API docs page
- Docker, Vercel, Netlify, and GitHub Pages deployment files
- Vercel serverless API skeleton under `api/`
- CI workflow for lint and build checks
- Documentation for API, architecture, deployment, desktop packaging, security, and contribution

## Quick start

```bash
npm install
npm run dev:full
```

Open the URL printed by Vite. The API service runs on `http://localhost:8787` during development. For production, deploy the web app to GitHub Pages, Vercel, or Netlify and deploy the API service to a Node host.

## Build

```bash
npm run lint
npm run build
npm run preview
```

## Public deployment

Vercel:

```bash
npm run build
vercel --prod
```

Netlify:

```bash
npm run build
netlify deploy --prod --dir=dist
```

Docker:

```bash
docker compose up --build
```

GitHub Pages is configured in `.github/workflows/pages.yml`. Push to `main`, then enable Pages in the repository settings with GitHub Actions as the source.

## Backend contract

The frontend expects:

- `POST /auth/login` or `POST /api/auth/login`
- `GET /auth/session` or `GET /api/auth/session`
- `POST /agent/runs` or `POST /api/agent/runs`
- `GET /agent/runs/:id/events` or `GET /api/agent/runs/:id/events`
- `POST /agent/runs/:id/approve`
- `POST /files/upload`
- `POST /workflows/:id/execute`

See [docs/API.md](docs/API.md).

## Desktop apps

The repository now includes a Tauri desktop client scaffold in `apps/desktop`. The release workflow builds:

- Windows x64 installer
- macOS Apple Silicon DMG
- macOS Intel DMG

See [docs/DESKTOP.md](docs/DESKTOP.md) and `.github/workflows/desktop-release.yml`.

## GitHub publishing

This machine does not have the GitHub CLI installed, so creating the remote repository requires your GitHub account or token. After creating an empty GitHub repo, run:

```bash
git remote add origin git@github.com:YOUR_NAME/tech-agent.git
git branch -M main
git push -u origin main
```

## License

MIT. See [LICENSE](LICENSE).
