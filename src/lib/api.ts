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

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const demoEmailCode = '246810'

export function getDefaultApiBaseUrl() {
  return defaultApiBaseUrl
}

export async function sendEmailCode(payload: SendCodePayload) {
  const baseUrl = normalizeBaseUrl(payload.apiBaseUrl)
  try {
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

    return response.json() as Promise<{ sent: boolean; demoCode?: string; expiresIn: number }>
  } catch (error) {
    if (canUseDemoFallback(payload.apiBaseUrl, baseUrl)) {
      return { sent: true, demoCode: demoEmailCode, expiresIn: 600 }
    }

    throw error
  }
}

export async function verifyEmailCode(payload: VerifyCodePayload): Promise<Session> {
  const baseUrl = normalizeBaseUrl(payload.apiBaseUrl)
  try {
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
  } catch (error) {
    if (canUseDemoFallback(payload.apiBaseUrl, baseUrl) && payload.code === demoEmailCode) {
      return demoSession({
        email: payload.email,
        organization: payload.organization,
        apiBaseUrl: '',
        password: '',
      })
    }

    throw error
  }
}

export async function loginToTechAgent(payload: LoginPayload): Promise<Session> {
  if (!payload.apiBaseUrl) {
    return demoSession(payload)
  }

  const baseUrl = normalizeBaseUrl(payload.apiBaseUrl)
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
    return {
      id: crypto.randomUUID(),
      status: 'queued',
      message: 'Demo cloud run queued',
    }
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
    return { providers: [] as ProviderConnection[] }
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
    return {
      id: crypto.randomUUID(),
      name: payload.name,
      baseUrl: payload.baseUrl,
      model: payload.model,
      keyPreview: maskKey(payload.apiKey),
      status: 'connected',
      createdAt: new Date().toISOString(),
    }
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

function demoSession(payload: LoginPayload): Session {
  return {
    user: payload.email.split('@')[0] || 'Owner',
    email: payload.email || 'owner@tech-agent.dev',
    org: payload.organization || 'Tech-agent Cloud',
    role: 'Owner',
    token: crypto.randomUUID(),
    apiBaseUrl: '',
  }
}

function normalizeBaseUrl(apiBaseUrl: string) {
  return (apiBaseUrl || defaultApiBaseUrl).replace(/\/$/, '')
}

function canUseDemoFallback(apiBaseUrl: string, baseUrl: string) {
  return !apiBaseUrl || baseUrl === '/api'
}

function maskKey(apiKey: string) {
  if (apiKey.length <= 8) {
    return 'stored'
  }

  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
}
