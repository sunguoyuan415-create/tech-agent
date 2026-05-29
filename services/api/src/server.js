import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import crypto from 'node:crypto'

const app = express()
const port = Number(process.env.PORT || 8787)
const publicWebOrigin = process.env.WEB_ORIGIN || 'http://localhost:5173'

const codes = new Map()
const sessions = new Map()
const providersByOrg = new Map()
const runs = new Map()

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === publicWebOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true)
        return
      }
      callback(new Error(`Origin ${origin} is not allowed`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'tech-agent-api',
    version: '0.2.0',
    time: new Date().toISOString(),
  })
})

app.post('/auth/send-code', (request, response) => {
  const email = normalizeEmail(request.body?.email)
  if (!email) {
    response.status(400).json({ error: 'Email is required' })
    return
  }

  const code = process.env.DEMO_EMAIL_CODE || '246810'
  const expiresAt = Date.now() + 10 * 60 * 1000
  codes.set(email, { code, expiresAt, attempts: 0 })

  response.json({
    email,
    sent: true,
    expiresIn: 600,
    delivery: process.env.SMTP_HOST ? 'smtp' : 'demo',
    demoCode: process.env.SMTP_HOST ? undefined : code,
  })
})

app.post('/auth/verify-code', (request, response) => {
  const email = normalizeEmail(request.body?.email)
  const code = String(request.body?.code || '')
  const organization = String(request.body?.organization || 'Tech-agent Cloud')
  const apiBaseUrl = String(request.body?.apiBaseUrl || '')
  const record = codes.get(email)

  if (!record || record.expiresAt < Date.now()) {
    response.status(401).json({ error: 'Verification code expired' })
    return
  }

  record.attempts += 1
  if (record.attempts > 5) {
    codes.delete(email)
    response.status(429).json({ error: 'Too many attempts' })
    return
  }

  if (record.code !== code) {
    response.status(401).json({ error: 'Invalid verification code' })
    return
  }

  codes.delete(email)
  const session = createSession({ email, organization, apiBaseUrl })
  sessions.set(session.token, session)
  response.json(session)
})

app.post('/auth/login', (request, response) => {
  const email = normalizeEmail(request.body?.email)
  const organization = String(request.body?.organization || 'Tech-agent Cloud')
  const apiBaseUrl = String(request.body?.apiBaseUrl || '')

  if (!email) {
    response.status(400).json({ error: 'Email is required' })
    return
  }

  const session = createSession({ email, organization, apiBaseUrl })
  sessions.set(session.token, session)
  response.json(session)
})

app.get('/auth/session', requireSession, (request, response) => {
  response.json({
    ...request.session,
    features: ['email-code', 'provider-vault', 'agent-runs', 'workflow-os', 'cloud-computer'],
  })
})

app.get('/providers', requireSession, (request, response) => {
  response.json({
    providers: getProviders(request.session.org),
  })
})

app.post('/providers', requireSession, (request, response) => {
  const provider = {
    id: crypto.randomUUID(),
    name: String(request.body?.name || 'Custom Provider'),
    baseUrl: String(request.body?.baseUrl || ''),
    model: String(request.body?.model || ''),
    keyPreview: maskKey(String(request.body?.apiKey || '')),
    status: request.body?.apiKey ? 'connected' : 'needs_key',
    createdAt: new Date().toISOString(),
  }

  const providers = getProviders(request.session.org)
  providers.unshift(provider)
  providersByOrg.set(request.session.org, providers)

  response.status(201).json(provider)
})

app.post('/agent/runs', requireSession, (request, response) => {
  const id = `run_${crypto.randomUUID()}`
  const run = {
    id,
    status: 'queued',
    workspaceId: String(request.body?.workspaceId || 'main'),
    modelProvider: String(request.body?.modelProvider || 'openai'),
    prompt: String(request.body?.prompt || ''),
    owner: request.session.email,
    createdAt: new Date().toISOString(),
    events: [
      event('Planner', 'Intent routed into the AI Workforce OS.', 'done'),
      event('Provider Router', 'Model provider selected and policy checked.', 'done'),
      event('Cloud Runtime', 'Sandbox allocation queued.', 'live'),
    ],
  }
  runs.set(id, run)
  response.status(202).json(run)
})

app.get('/agent/runs/:id/events', requireSession, (request, response) => {
  const run = runs.get(request.params.id)
  if (!run) {
    response.status(404).json({ error: 'Run not found' })
    return
  }
  response.json({ id: run.id, events: run.events })
})

app.get('/marketplace/plugins', (_request, response) => {
  response.json({
    plugins: [
      'GitHub Engineer',
      'Browser Fleet',
      'Cloud IDE',
      'Knowledge Trainer',
      'DevOps Sentinel',
      'Design Reviewer',
    ],
  })
})

app.use((error, _request, response, _next) => {
  response.status(500).json({
    error: error instanceof Error ? error.message : 'Internal server error',
  })
})

app.listen(port, () => {
  console.log(`Tech-agent API listening on http://localhost:${port}`)
})

function requireSession(request, response, next) {
  const token = String(request.headers.authorization || '').replace('Bearer ', '')
  const session = sessions.get(token)
  if (!session) {
    response.status(401).json({ error: 'Unauthorized' })
    return
  }
  request.session = session
  next()
}

function createSession({ email, organization, apiBaseUrl }) {
  return {
    user: email.split('@')[0] || 'owner',
    email,
    org: organization,
    role: 'Owner',
    token: crypto.randomUUID(),
    apiBaseUrl,
  }
}

function getProviders(org) {
  if (!providersByOrg.has(org)) {
    providersByOrg.set(org, [
      {
        id: 'openai-default',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-5',
        keyPreview: 'not connected',
        status: 'needs_key',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'anthropic-default',
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-opus',
        keyPreview: 'not connected',
        status: 'needs_key',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'gemini-default',
        name: 'Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-pro',
        keyPreview: 'not connected',
        status: 'needs_key',
        createdAt: new Date().toISOString(),
      },
    ])
  }
  return providersByOrg.get(org)
}

function event(actor, message, state) {
  return {
    time: new Date().toISOString(),
    actor,
    event: message,
    state,
  }
}

function maskKey(key) {
  if (!key) return 'not connected'
  if (key.length <= 8) return 'connected'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}
