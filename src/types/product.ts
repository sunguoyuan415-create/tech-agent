import type { LucideIcon } from 'lucide-react'

export type ViewId =
  | 'workspace'
  | 'agents'
  | 'workflows'
  | 'plugins'
  | 'downloads'
  | 'admin'
  | 'docs'

export type AgentStatus = 'ready' | 'running' | 'paused' | 'review'

export type ProviderStatus = 'connected' | 'missing' | 'degraded'

export interface Session {
  user: string
  email: string
  org: string
  role: 'Owner' | 'Admin' | 'Member'
  token: string
  apiBaseUrl: string
}

export interface NavItem {
  id: ViewId
  label: string
  icon: LucideIcon
}

export interface Capability {
  title: string
  description: string
  accent: 'cyan' | 'green' | 'amber' | 'rose' | 'blue'
  icon: LucideIcon
}

export interface AgentProfile {
  name: string
  role: string
  status: AgentStatus
  model: string
  score: string
  tools: string[]
  backlog: number
}

export interface Provider {
  name: string
  status: ProviderStatus
  latency: string
  cost: string
  route: string
}

export interface WorkflowNode {
  title: string
  kind: string
  state: 'complete' | 'active' | 'waiting'
  meta: string
}

export interface ToolItem {
  name: string
  description: string
  permission: 'Auto' | 'Review' | 'Locked'
  icon: LucideIcon
}

export interface RunEvent {
  time: string
  actor: string
  event: string
  state: 'done' | 'live' | 'queued'
}

export interface Artifact {
  name: string
  type: string
  size: string
  status: 'Synced' | 'Draft' | 'Signed'
}

export interface DownloadBuild {
  platform: string
  file: string
  status: 'Release ready' | 'Nightly' | 'Planned'
  size: string
}

export interface Plugin {
  name: string
  category: string
  installs: string
  trust: string
  enabled: boolean
  description: string
}

export interface AuditItem {
  time: string
  user: string
  action: string
  risk: 'Low' | 'Medium' | 'High'
}
