import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import crypto from 'node:crypto'
import {
  createSession,
  createVerificationChallenge,
  maskKey,
  normalizeEmail,
  readSession,
  sendVerificationEmail,
  verifyEmailChallenge,
  verifyProviderKey,
} from '../../../api/_lib/auth.js'

const app = express()
const port = Number(process.env.PORT || 8787)
const publicWebOrigins = (process.env.WEB_ORIGIN || 'http://localhost:5173,https://sunguoyuan415-create.github.io')
  .split(',')
  .map((origin) => origin.trim())

const providersByOrg = new Map()
const runs = new Map()

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || publicWebOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
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

app.post('/auth/send-code', async (request, response) => {
  const email = normalizeEmail(request.body?.email)
  if (!email) {
    response.status(400).json({ error: 'Email is required' })
    return
  }

  const challenge = createVerificationChallenge(email)
  await sendVerificationEmail({ email, code: challenge.code })

  response.json({
    email,
    sent: true,
    expiresIn: challenge.expiresIn,
    verificationId: challenge.verificationId,
    delivery: 'email',
  })
})

app.post('/auth/verify-code', (request, response) => {
  const email = normalizeEmail(request.body?.email)
  const code = String(request.body?.code || '')
  const organization = String(request.body?.organization || 'Tech-agent Cloud')
  const apiBaseUrl = String(request.body?.apiBaseUrl || '')
  const verificationId = String(request.body?.verificationId || '')

  verifyEmailChallenge({ email, code, verificationId })
  const session = createSession({ email, organization, apiBaseUrl })
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

app.post('/providers', requireSession, async (request, response) => {
  const keyCheck = await verifyProviderKey({
    name: request.body?.name,
    baseUrl: request.body?.baseUrl,
    apiKey: request.body?.apiKey,
  })
  const provider = {
    id: crypto.randomUUID(),
    name: String(request.body?.name || 'Custom Provider'),
    baseUrl: String(request.body?.baseUrl || ''),
    model: String(request.body?.model || ''),
    keyPreview: maskKey(String(request.body?.apiKey || '')),
    status: keyCheck.verified ? 'connected' : 'needs_key',
    checkedUrl: keyCheck.checkedUrl,
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
  try {
    request.session = readSession(request.headers.authorization)
    next()
  } catch (error) {
    response.status(error.statusCode || 401).json({ error: error instanceof Error ? error.message : 'Unauthorized' })
    return
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
