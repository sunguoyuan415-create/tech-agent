import crypto from 'node:crypto'

const verificationTtlMs = 10 * 60 * 1000
const sessionTtlMs = 7 * 24 * 60 * 60 * 1000

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}

export function createVerificationChallenge(email) {
  const normalizedEmail = normalizeEmail(email)
  const code = String(crypto.randomInt(100000, 1000000))
  const expiresAt = Date.now() + verificationTtlMs
  const nonce = crypto.randomUUID()
  const verificationId = signPayload({
    kind: 'email-code',
    email: normalizedEmail,
    codeHash: hashCode(normalizedEmail, code, nonce),
    nonce,
    expiresAt,
  })

  return {
    code,
    expiresAt,
    expiresIn: Math.floor(verificationTtlMs / 1000),
    verificationId,
  }
}

export function verifyEmailChallenge({ email, code, verificationId }) {
  const normalizedEmail = normalizeEmail(email)
  const payload = verifySignedPayload(verificationId)

  if (payload.kind !== 'email-code') {
    throw Object.assign(new Error('Invalid verification challenge'), { statusCode: 401 })
  }

  if (payload.email !== normalizedEmail) {
    throw Object.assign(new Error('Verification email mismatch'), { statusCode: 401 })
  }

  if (Number(payload.expiresAt) < Date.now()) {
    throw Object.assign(new Error('Verification code expired'), { statusCode: 401 })
  }

  const expectedHash = hashCode(normalizedEmail, String(code || ''), String(payload.nonce || ''))
  if (String(payload.codeHash).length !== expectedHash.length) {
    throw Object.assign(new Error('Invalid verification code'), { statusCode: 401 })
  }

  if (!crypto.timingSafeEqual(Buffer.from(String(payload.codeHash)), Buffer.from(expectedHash))) {
    throw Object.assign(new Error('Invalid verification code'), { statusCode: 401 })
  }

  return true
}

export function createSession({ email, organization, apiBaseUrl }) {
  const normalizedEmail = normalizeEmail(email)
  const session = {
    user: normalizedEmail.split('@')[0] || 'owner',
    email: normalizedEmail,
    org: String(organization || 'Tech-agent Cloud'),
    role: 'Owner',
    apiBaseUrl: String(apiBaseUrl || ''),
    expiresAt: Date.now() + sessionTtlMs,
  }

  return {
    ...session,
    token: signPayload({ kind: 'session', ...session }),
  }
}

export function readSession(authorizationHeader) {
  const token = String(authorizationHeader || '').replace('Bearer ', '')
  if (!token) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
  }

  const session = verifySignedPayload(token)
  if (session.kind !== 'session' || Number(session.expiresAt) < Date.now()) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
  }

  return {
    user: session.user,
    email: session.email,
    org: session.org,
    role: session.role,
    apiBaseUrl: session.apiBaseUrl,
    token,
  }
}

export async function sendVerificationEmail({ email, code }) {
  const resendApiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!resendApiKey || !from) {
    throw Object.assign(new Error('Real email is not configured. Set RESEND_API_KEY and EMAIL_FROM on the API host.'), {
      statusCode: 503,
    })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${resendApiKey}`,
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your Tech-agent verification code',
      text: `Your Tech-agent verification code is ${code}. It expires in 10 minutes.`,
      html: verificationEmailHtml(code),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw Object.assign(new Error(`Email provider returned ${response.status}: ${body.slice(0, 240)}`), {
      statusCode: 502,
    })
  }

  return response.json()
}

export async function verifyProviderKey({ name, baseUrl, apiKey }) {
  if (!apiKey) {
    throw Object.assign(new Error('API key is required'), { statusCode: 400 })
  }

  const provider = String(name || '').toLowerCase()
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/$/, '')

  if (provider.includes('gemini') || normalizedBaseUrl.includes('generativelanguage.googleapis.com')) {
    return verifyGeminiKey(apiKey)
  }

  if (provider.includes('anthropic') || normalizedBaseUrl.includes('anthropic.com')) {
    return verifyAnthropicKey(apiKey, normalizedBaseUrl)
  }

  return verifyOpenAICompatibleKey(apiKey, normalizedBaseUrl)
}

export function maskKey(key) {
  if (!key) return 'not connected'
  if (key.length <= 8) return 'connected'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

export function sendJson(response, status, payload) {
  response.status(status).json(payload)
}

export function handleCors(request, response) {
  const allowedOrigins = (process.env.WEB_ORIGIN || 'https://sunguoyuan415-create.github.io,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
  const requestOrigin = request.headers.origin
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0]

  response.setHeader('Access-Control-Allow-Origin', allowOrigin)
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return true
  }

  return false
}

export function sendError(response, error) {
  const status = Number(error?.statusCode || 500)
  response.status(status).json({
    error: error instanceof Error ? error.message : 'Internal server error',
  })
}

function signPayload(payload) {
  const encoded = base64UrlEncode(JSON.stringify(payload))
  return `${encoded}.${signature(encoded)}`
}

function verifySignedPayload(token) {
  const [encoded, receivedSignature] = String(token || '').split('.')
  if (!encoded || !receivedSignature) {
    throw Object.assign(new Error('Invalid token'), { statusCode: 401 })
  }

  const expectedSignature = signature(encoded)
  if (receivedSignature.length !== expectedSignature.length) {
    throw Object.assign(new Error('Invalid token signature'), { statusCode: 401 })
  }

  if (!crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) {
    throw Object.assign(new Error('Invalid token signature'), { statusCode: 401 })
  }

  return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
}

function signature(encoded) {
  return crypto.createHmac('sha256', getAuthSecret()).update(encoded).digest('base64url')
}

function hashCode(email, code, nonce) {
  return crypto
    .createHmac('sha256', getAuthSecret())
    .update(`${email}:${code}:${nonce}`)
    .digest('hex')
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw Object.assign(new Error('AUTH_SECRET must be set to at least 32 characters on the API host.'), {
      statusCode: 503,
    })
  }

  return secret
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function verificationEmailHtml(code) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0b0f14;color:#f7fafc;padding:32px">
      <div style="max-width:520px;margin:auto;border:1px solid #26313d;border-radius:14px;padding:28px;background:#111820">
        <h1 style="margin:0 0 12px;font-size:22px">Tech-agent verification</h1>
        <p style="color:#aeb7c2;margin:0 0 22px">Use this code to sign in. It expires in 10 minutes.</p>
        <div style="font-size:34px;letter-spacing:8px;font-weight:800;color:#5eead4">${code}</div>
        <p style="color:#768292;margin-top:24px">If you did not request this code, ignore this email.</p>
      </div>
    </div>
  `
}

async function verifyOpenAICompatibleKey(apiKey, baseUrl) {
  const url = `${baseUrl || 'https://api.openai.com/v1'}/models`
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw Object.assign(new Error(`Provider rejected API key with ${response.status}`), { statusCode: 401 })
  }

  return { verified: true, checkedUrl: url }
}

async function verifyAnthropicKey(apiKey, baseUrl) {
  const root = baseUrl && baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl || 'https://api.anthropic.com'}/v1`
  const url = `${root}/models`
  const response = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })

  if (!response.ok) {
    throw Object.assign(new Error(`Provider rejected API key with ${response.status}`), { statusCode: 401 })
  }

  return { verified: true, checkedUrl: url }
}

async function verifyGeminiKey(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw Object.assign(new Error(`Provider rejected API key with ${response.status}`), { statusCode: 401 })
  }

  return { verified: true, checkedUrl: 'https://generativelanguage.googleapis.com/v1beta/models' }
}
