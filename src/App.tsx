import { useEffect, useMemo, useState, type FormEvent } from 'react'
import clsx from 'clsx'
import {
  Activity,
  Bell,
  Bot,
  CircleDot,
  Cloud,
  Command,
  Copy,
  Download,
  ExternalLink,
  Gauge,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  PackageCheck,
  PanelLeft,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  Workflow,
} from 'lucide-react'
import {
  adminTiles,
  agentProfiles,
  artifacts,
  auditItems,
  capabilities,
  commandActions,
  docsSections,
  downloads,
  heroVisualRows,
  platformBadges,
  plugins,
  productStats,
  providers,
  runEvents,
  tools,
  workflowNodes,
} from './data/product'
import { loginToTechAgent, startAgentRun } from './lib/api'
import { useLocalStorage } from './lib/useLocalStorage'
import type { NavItem, Session, ViewId } from './types/product'
import './App.css'

const navItems: NavItem[] = [
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'plugins', label: 'Plugins', icon: PackageCheck },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
  { id: 'docs', label: 'Docs', icon: KeyRound },
]

const defaultPrompt =
  'Build a public Tech-agent workspace, connect model APIs, prepare downloads, and publish the open-source repo.'

type ApiKeys = Record<'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'custom', string>

function App() {
  const [session, setSession] = useLocalStorage<Session | null>('tech-agent-session', null)
  const [activeView, setActiveView] = useState<ViewId>('workspace')
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [activeAgent, setActiveAgent] = useState(agentProfiles[0].name)
  const [authError, setAuthError] = useState('')
  const [runState, setRunState] = useState<'idle' | 'queued' | 'running' | 'complete'>('running')
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('tech-agent-api-vault', {
    openai: '',
    anthropic: '',
    gemini: '',
    deepseek: '',
    custom: '',
  })
  const [messages, setMessages] = useState([
    {
      role: 'user',
      content: '我要一个开源、可下载、云端运行、网页可用的 Tech-agent。',
    },
    {
      role: 'agent',
      content:
        '已建立完整产品目标：高级 Web 工作台、登录/API 接入、云 Agent Runtime、插件市场、工作流、下载页、开源部署。',
    },
    {
      role: 'agent',
      content:
        '当前正在生成可公开部署的 React + TypeScript 网页版，并准备 GitHub、Vercel、Docker 与桌面端打包说明。',
    },
  ])

  const activeAgentProfile = useMemo(
    () => agentProfiles.find((agent) => agent.name === activeAgent) ?? agentProfiles[0],
    [activeAgent],
  )

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 })
  }, [session, activeView])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: String(formData.get('email') || 'owner@tech-agent.dev'),
      password: String(formData.get('password') || 'tech-agent'),
      apiBaseUrl: String(formData.get('apiBaseUrl') || '').trim(),
      organization: String(formData.get('organization') || 'Tech-agent Cloud'),
    }

    try {
      const nextSession = await loginToTechAgent(payload)
      setSession(nextSession)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to reach login API')
    }
  }

  async function handleRun() {
    const nextPrompt = prompt.trim()
    if (!nextPrompt) {
      return
    }

    setMessages((current) => [
      ...current,
      { role: 'user', content: nextPrompt },
      {
        role: 'agent',
        content:
          '收到。Builder、Researcher、Operator、Analyst 已进入同一个云端任务，开始规划、执行、验证和发布。',
      },
    ])
    setRunState('queued')

    if (session) {
      try {
        await startAgentRun(session, {
          prompt: nextPrompt,
          modelProvider: 'openai',
          apiKey: apiKeys.openai,
          workspaceId: 'main',
        })
        setRunState('running')
      } catch {
        setRunState('running')
      }
    }
  }

  if (!session) {
    return <AuthGateway authError={authError} onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">
      <SideRail activeView={activeView} onChange={setActiveView} />
      <main className="app-main">
        <TopBar
          activeView={activeView}
          session={session}
          runState={runState}
          onLogout={() => setSession(null)}
        />
        {activeView === 'workspace' && (
          <WorkspaceView
            activeAgent={activeAgent}
            activeAgentProfile={activeAgentProfile}
            apiKeys={apiKeys}
            messages={messages}
            prompt={prompt}
            runState={runState}
            session={session}
            onAgentChange={setActiveAgent}
            onApiKeysChange={setApiKeys}
            onPromptChange={setPrompt}
            onRun={handleRun}
            onRunStateChange={setRunState}
          />
        )}
        {activeView === 'agents' && <AgentsView activeAgent={activeAgent} onAgentChange={setActiveAgent} />}
        {activeView === 'workflows' && <WorkflowsView />}
        {activeView === 'plugins' && <PluginsView />}
        {activeView === 'downloads' && <DownloadsView />}
        {activeView === 'admin' && <AdminView />}
        {activeView === 'docs' && <DocsView />}
      </main>
    </div>
  )
}

interface AuthGatewayProps {
  authError: string
  onLogin: (event: FormEvent<HTMLFormElement>) => void
}

function AuthGateway({ authError, onLogin }: AuthGatewayProps) {
  const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

  return (
    <main className="auth-shell">
      <section className="auth-product">
        <div className="brand-row">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <strong>Tech-agent</strong>
            <span>Cloud Agent OS</span>
          </div>
        </div>

        <div className="auth-headline">
          <span className="eyebrow">Open-source cloud workspace</span>
          <h1>One agent console for code, web, files, data, ops, and releases.</h1>
          <p>
            A public web app with login, API routing, plugin permissions, cloud execution panels,
            workflows, desktop download surfaces, and deploy-ready open-source structure.
          </p>
        </div>

        <div className="capability-strip">
          {capabilities.map((capability) => {
            const Icon = capability.icon
            return (
              <article className={clsx('capability-card', capability.accent)} key={capability.title}>
                <Icon size={20} />
                <h2>{capability.title}</h2>
                <p>{capability.description}</p>
              </article>
            )
          })}
        </div>

        <div className="visual-console" aria-label="Tech-agent live system preview">
          <div className="visual-top">
            <span />
            <span />
            <span />
            <strong>cloud-runtime/prod</strong>
          </div>
          <div className="visual-grid">
            {heroVisualRows.map((row) => {
              const Icon = row.icon
              return (
                <div className="visual-cell" key={row.label}>
                  <Icon size={16} />
                  <span>{row.label}</span>
                  <b>{row.value}</b>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="auth-panel" aria-label="Sign in">
        <div className="panel-heading">
          <span className="status-pill online">
            <CircleDot size={14} />
            Public web
          </span>
          <h2>Enter Tech-agent</h2>
          <p>Connect a real API server or use the built-in cloud preview session.</p>
        </div>

        <form className="auth-form" onSubmit={onLogin}>
          <label>
            Email
            <input name="email" type="email" defaultValue="owner@tech-agent.dev" autoComplete="email" />
          </label>
          <label>
            Password
            <input name="password" type="password" defaultValue="tech-agent" autoComplete="current-password" />
          </label>
          <label>
            Organization
            <input name="organization" defaultValue="Tech-agent Cloud" />
          </label>
          <label>
            API base URL
            <input name="apiBaseUrl" defaultValue={defaultApiBaseUrl} placeholder="/api or https://api.tech-agent.dev" />
          </label>
          {authError && <p className="form-error">{authError}</p>}
          <button className="primary-button" type="submit">
            <KeyRound size={18} />
            Sign in
          </button>
        </form>

        <div className="oauth-row">
          <button type="button">
            <GitBranch size={18} />
            GitHub
          </button>
          <button type="button">
            <Cloud size={18} />
            SSO
          </button>
        </div>

        <div className="platform-row">
          {platformBadges.map((badge) => {
            const Icon = badge.icon
            return (
              <span key={badge.label}>
                <Icon size={15} />
                {badge.label}
              </span>
            )
          })}
        </div>
      </section>
    </main>
  )
}

interface TopBarProps {
  activeView: ViewId
  session: Session
  runState: 'idle' | 'queued' | 'running' | 'complete'
  onLogout: () => void
}

function TopBar({ activeView, session, runState, onLogout }: TopBarProps) {
  const title = navItems.find((item) => item.id === activeView)?.label ?? 'Workspace'

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="icon-button muted" type="button" aria-label="Toggle navigation">
          <PanelLeft size={19} />
        </button>
        <div>
          <span>{title}</span>
          <strong>{session.org}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        <span className={clsx('run-badge', runState)}>
          <Activity size={15} />
          {runState}
        </span>
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="icon-button" type="button" aria-label="Settings">
          <Settings2 size={18} />
        </button>
        <button className="user-chip" type="button" onClick={onLogout}>
          <span>{session.user.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{session.user}</strong>
            <small>{session.role}</small>
          </div>
        </button>
      </div>
    </header>
  )
}

interface SideRailProps {
  activeView: ViewId
  onChange: (view: ViewId) => void
}

function SideRail({ activeView, onChange }: SideRailProps) {
  return (
    <aside className="side-rail" aria-label="Primary navigation">
      <div className="side-brand">
        <Sparkles size={22} />
      </div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              className={clsx('rail-button', activeView === item.id && 'active')}
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              onClick={() => onChange(item.id)}
            >
              <Icon size={21} />
            </button>
          )
        })}
      </nav>
      <button className="rail-button" type="button" title="Command palette" aria-label="Command palette">
        <Command size={21} />
      </button>
    </aside>
  )
}

interface WorkspaceViewProps {
  activeAgent: string
  activeAgentProfile: (typeof agentProfiles)[number]
  apiKeys: ApiKeys
  messages: Array<{ role: string; content: string }>
  prompt: string
  runState: 'idle' | 'queued' | 'running' | 'complete'
  session: Session
  onAgentChange: (agent: string) => void
  onApiKeysChange: (keys: ApiKeys) => void
  onPromptChange: (prompt: string) => void
  onRun: () => void
  onRunStateChange: (state: 'idle' | 'queued' | 'running' | 'complete') => void
}

function WorkspaceView({
  activeAgent,
  activeAgentProfile,
  apiKeys,
  messages,
  prompt,
  runState,
  session,
  onAgentChange,
  onApiKeysChange,
  onPromptChange,
  onRun,
  onRunStateChange,
}: WorkspaceViewProps) {
  return (
    <div className="workspace-layout">
      <aside className="left-pane">
        <section className="panel">
          <div className="panel-heading compact">
            <span>Agents</span>
            <button className="icon-button muted" type="button" aria-label="Add agent">
              <Plus size={17} />
            </button>
          </div>
          <div className="agent-list">
            {agentProfiles.map((agent) => (
              <button
                className={clsx('agent-row', activeAgent === agent.name && 'active')}
                key={agent.name}
                type="button"
                onClick={() => onAgentChange(agent.name)}
              >
                <span className={clsx('agent-dot', agent.status)} />
                <div>
                  <strong>{agent.name}</strong>
                  <small>{agent.role}</small>
                </div>
                <b>{agent.backlog}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="panel metric-panel">
          <div className="panel-heading compact">
            <span>Runtime</span>
            <span className="status-pill online">cloud</span>
          </div>
          <div className="runtime-meter">
            <Gauge size={38} />
            <div>
              <strong>98.7%</strong>
              <span>success rate</span>
            </div>
          </div>
          <div className="meter-bars">
            <span style={{ height: '42%' }} />
            <span style={{ height: '70%' }} />
            <span style={{ height: '54%' }} />
            <span style={{ height: '88%' }} />
            <span style={{ height: '66%' }} />
            <span style={{ height: '94%' }} />
            <span style={{ height: '74%' }} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading compact">
            <span>Providers</span>
            <SlidersHorizontal size={16} />
          </div>
          <div className="provider-list">
            {providers.map((provider) => (
              <div className="provider-row" key={provider.name}>
                <span className={clsx('provider-status', provider.status)} />
                <div>
                  <strong>{provider.name}</strong>
                  <small>{provider.route}</small>
                </div>
                <em>{provider.latency}</em>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <section className="center-pane">
        <div className="command-panel">
          <div className="command-context">
            <span className="status-pill online">
              <Sparkles size={14} />
              {activeAgentProfile.name}
            </span>
            <span>{activeAgentProfile.model}</span>
            <span>{activeAgentProfile.score} reliability</span>
            <span>{runState} mode</span>
          </div>
          <textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} />
          <div className="command-footer">
            <div className="command-actions">
              {commandActions.map((action) => {
                const Icon = action.icon
                return (
                  <button key={action.label} type="button">
                    <Icon size={16} />
                    {action.label}
                  </button>
                )
              })}
            </div>
            <button className="run-button" type="button" onClick={onRun}>
              <Send size={18} />
              Run
            </button>
          </div>
        </div>

        <div className="conversation-panel">
          <div className="panel-heading compact">
            <span>Live Conversation</span>
            <div className="inline-actions">
              <button className="icon-button muted" type="button" aria-label="Pause run" onClick={() => onRunStateChange('idle')}>
                <Pause size={16} />
              </button>
              <button className="icon-button muted" type="button" aria-label="Resume run" onClick={() => onRunStateChange('running')}>
                <Play size={16} />
              </button>
            </div>
          </div>
          <div className="message-list">
            {messages.map((message, index) => (
              <article className={clsx('message', message.role)} key={`${message.role}-${index}`}>
                <span>{message.role === 'agent' ? 'TA' : 'YOU'}</span>
                <p>{message.content}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="wide-panel tool-grid">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <article className="tool-tile" key={tool.name}>
                <div>
                  <Icon size={19} />
                  <span className={clsx('permission', tool.permission.toLowerCase())}>{tool.permission}</span>
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <aside className="right-pane">
        <section className="panel">
          <div className="panel-heading compact">
            <span>Plan Timeline</span>
            <RefreshCw size={16} />
          </div>
          <div className="timeline">
            {runEvents.map((event) => (
              <div className={clsx('timeline-item', event.state)} key={`${event.time}-${event.actor}`}>
                <span>{event.time}</span>
                <div>
                  <strong>{event.actor}</strong>
                  <p>{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading compact">
            <span>API Vault</span>
            <ShieldCheck size={16} />
          </div>
          <div className="vault-form">
            {Object.entries(apiKeys).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  value={value}
                  type="password"
                  placeholder={`${key.toUpperCase()}_API_KEY`}
                  onChange={(event) => onApiKeysChange({ ...apiKeys, [key]: event.target.value })}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading compact">
            <span>Artifacts</span>
            <button
              className="icon-button muted"
              type="button"
              aria-label="Copy session token"
              onClick={() => navigator.clipboard?.writeText(session.token)}
            >
              <Copy size={15} />
            </button>
          </div>
          <div className="artifact-list">
            {artifacts.map((artifact) => (
              <div className="artifact-row" key={artifact.name}>
                <div>
                  <strong>{artifact.name}</strong>
                  <small>{artifact.type}</small>
                </div>
                <span>{artifact.status}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}

interface AgentsViewProps {
  activeAgent: string
  onAgentChange: (agent: string) => void
}

function AgentsView({ activeAgent, onAgentChange }: AgentsViewProps) {
  return (
    <div className="page-grid">
      <section className="wide-panel page-hero">
        <div>
          <span className="eyebrow">Multi-agent command</span>
          <h1>Specialists that share memory, tools, files, and release context.</h1>
        </div>
        <button className="primary-button" type="button">
          <Plus size={18} />
          New agent
        </button>
      </section>
      <section className="agent-card-grid">
        {agentProfiles.map((agent) => (
          <article className={clsx('agent-card', activeAgent === agent.name && 'active')} key={agent.name}>
            <div className="agent-card-top">
              <span className={clsx('agent-dot', agent.status)} />
              <button type="button" onClick={() => onAgentChange(agent.name)}>
                Select
              </button>
            </div>
            <h2>{agent.name}</h2>
            <p>{agent.role}</p>
            <div className="agent-card-meta">
              <span>{agent.model}</span>
              <span>{agent.score}</span>
              <span>{agent.backlog} queued</span>
            </div>
            <div className="tag-row">
              {agent.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function WorkflowsView() {
  return (
    <div className="page-grid">
      <section className="wide-panel page-hero">
        <div>
          <span className="eyebrow">Workflow studio</span>
          <h1>Visual automation for long-running cloud tasks and human approvals.</h1>
        </div>
        <button className="primary-button" type="button">
          <Workflow size={18} />
          Build workflow
        </button>
      </section>
      <section className="workflow-canvas">
        {workflowNodes.map((node, index) => (
          <article className={clsx('workflow-node', node.state)} key={node.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{node.title}</h2>
            <p>{node.meta}</p>
            <small>{node.kind}</small>
          </article>
        ))}
      </section>
    </div>
  )
}

function PluginsView() {
  return (
    <div className="page-grid">
      <section className="wide-panel page-hero">
        <div>
          <span className="eyebrow">Plugin marketplace</span>
          <h1>Install tools with declared permissions, trust levels, and sandbox boundaries.</h1>
        </div>
        <button className="primary-button" type="button">
          <ExternalLink size={18} />
          Submit plugin
        </button>
      </section>
      <section className="plugin-grid">
        {plugins.map((plugin) => (
          <article className="plugin-card" key={plugin.name}>
            <div className="plugin-top">
              <span>{plugin.category}</span>
              <strong>{plugin.trust}</strong>
            </div>
            <h2>{plugin.name}</h2>
            <p>{plugin.description}</p>
            <div className="plugin-bottom">
              <span>{plugin.installs} installs</span>
              <button className={clsx(plugin.enabled && 'enabled')} type="button">
                {plugin.enabled ? 'Enabled' : 'Install'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function DownloadsView() {
  return (
    <div className="page-grid">
      <section className="wide-panel page-hero">
        <div>
          <span className="eyebrow">Public downloads</span>
          <h1>Windows, macOS, Web, and Docker distribution surfaces are ready for release links.</h1>
        </div>
        <a className="primary-button link-button" href="https://github.com/" target="_blank" rel="noreferrer">
          <GitBranch size={18} />
          GitHub releases
        </a>
      </section>
      <section className="download-table wide-panel">
        <div className="download-head">
          <span>Platform</span>
          <span>Artifact</span>
          <span>Status</span>
          <span>Size</span>
        </div>
        {downloads.map((download) => (
          <div className="download-row" key={download.platform}>
            <strong>{download.platform}</strong>
            <span>{download.file}</span>
            <em>{download.status}</em>
            <span>{download.size}</span>
          </div>
        ))}
      </section>
    </div>
  )
}

function AdminView() {
  return (
    <div className="page-grid">
      <section className="stat-grid">
        {productStats.map((stat) => {
          const Icon = stat.icon
          return (
            <article className="stat-card" key={stat.label}>
              <Icon size={21} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          )
        })}
      </section>
      <section className="stat-grid">
        {adminTiles.map((tile) => {
          const Icon = tile.icon
          return (
            <article className="stat-card admin" key={tile.label}>
              <Icon size={21} />
              <span>{tile.label}</span>
              <strong>{tile.value}</strong>
            </article>
          )
        })}
      </section>
      <section className="wide-panel audit-panel">
        <div className="panel-heading compact">
          <span>Audit stream</span>
          <ShieldCheck size={16} />
        </div>
        {auditItems.map((item) => (
          <div className="audit-row" key={`${item.time}-${item.action}`}>
            <span>{item.time}</span>
            <strong>{item.user}</strong>
            <p>{item.action}</p>
            <em className={item.risk.toLowerCase()}>{item.risk}</em>
          </div>
        ))}
      </section>
    </div>
  )
}

function DocsView() {
  return (
    <div className="page-grid">
      <section className="wide-panel page-hero">
        <div>
          <span className="eyebrow">Developer API</span>
          <h1>Everything needed to wire a real backend, model gateway, and cloud runtime.</h1>
        </div>
        <button className="primary-button" type="button">
          <Copy size={18} />
          Copy OpenAPI
        </button>
      </section>
      <section className="docs-grid">
        {docsSections.map((section) => {
          const Icon = section.icon
          return (
            <article className="docs-card" key={section.title}>
              <Icon size={20} />
              <h2>{section.title}</h2>
              {section.lines.map((line) => (
                <code key={line}>{line}</code>
              ))}
            </article>
          )
        })}
      </section>
      <section className="wide-panel terminal-panel">
        <div className="terminal-top">
          <span />
          <span />
          <span />
          <strong>deploy</strong>
        </div>
        <pre>
          <SquareTerminal size={17} />
          <code>{`npm run build
docker compose up --build
vercel --prod
git remote add origin git@github.com:YOUR_NAME/tech-agent.git
git push -u origin main`}</code>
        </pre>
      </section>
    </div>
  )
}

export default App
