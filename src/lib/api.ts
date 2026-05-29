import type { Session } from '../types/product'

export interface LoginPayload {
  email: string
  password: string
  apiBaseUrl: string
  organization: string
}

export interface SendCodePayload {
  email: string
  apiBaseUrl: string
}

export interface VerifyCodePayload {
  email: string
  code: string
  verificationId: string
  apiBaseUrl: string
  organization: string
}

export interface AgentRunPayload {
  prompt: string
  modelProvider: string
  apiKey?: string
  workspaceId: string
}

export interface ProviderPayload {
  name: string
  baseUrl: string
  model: string
  apiKey: string
}

export interface ProviderConnection {
  id: string
  name: string
  baseUrl: string
  model: string
  keyPreview: string
  status: string
  createdAt: string
}

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export function getDefaultApiBaseUrl() {
  return defaultApiBaseUrl
}

export async function sendEmailCode(payload: SendCodePayload) {
  const baseUrl = normalizeBaseUrl(payload.apiBaseUrl)
  if (!baseUrl) {
    throw new Error('Real API base URL is required')
  }

  const response = await fetch(`${baseUrl}/auth/send-code`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
    }),
  })

  if (!response.ok) {
    throw new Error(`Send code API returned ${response.status}`)
  }

  return response.json() as Promise<{ sent: boolean; verificationId: string; expiresIn: number; delivery: string }>
}

export async function verifyEmailCode(payload: VerifyCodePayload): Promise<Session> {
  const baseUrl = normalizeBaseUrl(payload.apiBaseUrl)
  if (!baseUrl) {
    throw new Error('Real API base URL is required')
  }

  const response = await fetch(`${baseUrl}/auth/verify-code`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Verify code API returned ${response.status}`)
  }

  const data = (await response.json()) as Partial<Session>

  return {
    user: data.user ?? payload.email.split('@')[0] ?? 'Tech Agent User',
    email: data.email ?? payload.email,
    org: data.org ?? payload.organization,
    role: data.role ?? 'Owner',
    token: data.token ?? crypto.randomUUID(),
    apiBaseUrl: baseUrl,
  }
}

export async function loginToTechAgent(payload: LoginPayload): Promise<Session> {
  const baseUrl = normalizeBaseUrl(payload.apiBaseUrl)
  if (!baseUrl) {
    throw new Error('Real API base URL is required')
  }

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      organization: payload.organization,
    }),
  })

  if (!response.ok) {
    throw new Error(`Login API returned ${response.status}`)
  }

  const data = (await response.json()) as Partial<Session>

  return {
    user: data.user ?? payload.email.split('@')[0] ?? 'Tech Agent User',
    email: data.email ?? payload.email,
    org: data.org ?? payload.organization,
    role: data.role ?? 'Owner',
    token: data.token ?? crypto.randomUUID(),
    apiBaseUrl: baseUrl,
  }
}

export async function startAgentRun(
  session: Session,
  payload: AgentRunPayload,
) {
  if (!session.apiBaseUrl) {
    throw new Error('Real API base URL is required')
  }

  const response = await fetch(`${normalizeBaseUrl(session.apiBaseUrl)}/agent/runs`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Agent API returned ${response.status}`)
  }

  return response.json()
}

export async function listProviders(session: Session) {
  if (!session.apiBaseUrl) {
    throw new Error('Real API base URL is required')
  }

  const response = await fetch(`${normalizeBaseUrl(session.apiBaseUrl)}/providers`, {
    headers: {
      authorization: `Bearer ${session.token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Providers API returned ${response.status}`)
  }

  return response.json() as Promise<{ providers: ProviderConnection[] }>
}

export async function connectProvider(session: Session, payload: ProviderPayload) {
  if (!session.apiBaseUrl) {
    throw new Error('Real API base URL is required')
  }

  const response = await fetch(`${normalizeBaseUrl(session.apiBaseUrl)}/providers`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Provider API returned ${response.status}`)
  }

  return response.json() as Promise<ProviderConnection>
}

function normalizeBaseUrl(apiBaseUrl: string) {
  return (apiBaseUrl || defaultApiBaseUrl).replace(/\/$/, '')
}
