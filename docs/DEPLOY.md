# Deployment

## Environment

Copy `.env.example` to `.env` and set:

```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_PUBLIC_APP_URL=https://app.your-domain.com
VITE_GITHUB_REPO=https://github.com/sunguoyuan415-create/tech-agent
AUTH_SECRET=generate-a-64-character-random-string
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Tech-agent <verify@your-domain.com>
WEB_ORIGIN=https://sunguoyuan415-create.github.io
```

## Vercel

1. Import the GitHub repository.
2. Use Vite as the framework preset.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Set `VITE_API_BASE_URL=/api` to use the included serverless API.
6. Set `VITE_GITHUB_REPO=https://github.com/sunguoyuan415-create/tech-agent`.
7. Set `VITE_PUBLIC_APP_URL` and `WEB_ORIGIN` to the production Vercel URL after the first deploy.
8. Set `AUTH_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM` in Vercel Project Settings. These are required for real email verification.

The app will not send login codes until `RESEND_API_KEY` and a verified `EMAIL_FROM` sender are configured.

## Netlify

The repository includes `netlify.toml`.

```bash
npm run build
netlify deploy --prod --dir=dist
```

## GitHub Pages

The repository includes `.github/workflows/pages.yml`.

1. Push to `main`.
2. Open repository settings.
3. Enable Pages.
4. Select GitHub Actions as the source.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:4173`.

## Production Checklist

- Connect a real API at `VITE_API_BASE_URL`.
- Deploy `services/api` to a Node host when using the full backend.
- Configure a real email provider. The built-in implementation uses Resend through `RESEND_API_KEY`.
- Use a verified sender domain for `EMAIL_FROM`.
- Configure OAuth redirect URLs.
- Enable HTTPS.
- Add error reporting.
- Add a privacy policy and terms page for public usage.
- Publish signed desktop artifacts through GitHub Releases.

## Full Backend

The Batch 2 backend lives in `services/api`.

```bash
npm run dev:api
```

Production hosts can run:

```bash
PORT=8787 WEB_ORIGIN=https://sunguoyuan415-create.github.io AUTH_SECRET=... RESEND_API_KEY=... EMAIL_FROM='Tech-agent <verify@your-domain.com>' node services/api/src/server.js
```

The frontend should use:

```bash
VITE_API_BASE_URL=https://your-api-host.example
```
