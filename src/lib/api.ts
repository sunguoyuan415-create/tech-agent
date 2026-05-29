import type { Session } from '../types/product'

export interface LoginPayload {
  email: string
  password: string
  apiBaseUrl: string
  organization: string
}

export interface AgentRunPayload {
  prompt: string
  modelProvider: string
  apiKey?: string
  workspaceId: string
}

export async function loginToTechAgent(payload: LoginPayload): Promise<Session> {
  if (!payload.apiBaseUrl) {
    return demoSession(payload)
  }

  const response = await fetch(`${payload.apiBaseUrl.replace(/\/$/, '')}/auth/login`, {
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
    apiBaseUrl: payload.apiBaseUrl,
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

  const response = await fetch(`${session.apiBaseUrl.replace(/\/$/, '')}/agent/runs`, {
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
