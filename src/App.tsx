import { useEffect, useMemo, useState, type FormEvent } from 'react'
import clsx from 'clsx'
import {
  Activity,
  Apple,
  Bell,
  Bot,
  BrainCircuit,
  ChevronRight,
  Cloud,
  Code2,
  Command,
  Cpu,
  Database,
  Download,
  FileText,
  Fingerprint,
  GitBranch,
  Globe2,
  HardDrive,
  KeyRound,
  Languages,
  LayoutDashboard,
  Laptop,
  Layers3,
  LockKeyhole,
  Mail,
  Moon,
  Network,
  PackageCheck,
  PanelLeft,
  PlugZap,
  Rocket,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  UploadCloud,
  Users,
  WandSparkles,
  Workflow,
} from 'lucide-react'
import {
  agentProfiles,
  capabilities,
  downloads,
  plugins,
  productStats,
  providers,
  workflowNodes,
} from './data/product'
import {
  connectProvider,
  getDefaultApiBaseUrl,
  listProviders,
  sendEmailCode,
  verifyEmailCode,
  type ProviderConnection,
} from './lib/api'
import { useLocalStorage } from './lib/useLocalStorage'
import type { Session } from './types/product'
import './App.css'

type Theme = 'dark' | 'light'
type Locale = 'zh' | 'en'
type PublicView = 'home' | 'product' | 'market' | 'download' | 'security' | 'developers' | 'pricing'
type AppView = 'command' | 'studio' | 'memory' | 'plugins' | 'computer' | 'tasks' | 'settings'

const copy = {
  zh: {
    nav: ['产品', '市场', '下载', '安全', '开发者', '价格'],
    signIn: '登录',
    enter: '进入控制台',
    heroKicker: '企业级云端 Agent 平台',
    heroTitle: '把开发、运营、数据和支持工作接入一个可治理的自动化平台。',
    heroBody:
      'Tech-agent 提供角色配置、知识库、插件权限、云端执行环境、任务队列和审计日志，团队可以通过网页、Windows 与 macOS 客户端统一使用。',
    primaryCta: '创建工作空间',
    secondaryCta: '查看系统架构',
    liveProduct: '实时产品蓝图',
    loginTitle: '邮箱验证码登录',
    loginBody: '先验证邮箱，再接入 AI API，所有核心执行都在云端运行。',
    sendCode: '发送验证码',
    verify: '验证并进入',
    email: '邮箱',
    code: '验证码',
    org: '组织空间',
    api: 'API 入口',
    demoCode: '演示验证码',
    dashboard: '控制中心',
    studio: 'Agent Studio',
    memory: '记忆实验室',
    plugins: '插件云',
    computer: '云电脑',
    tasks: '任务中心',
    settings: '设置',
  },
  en: {
    nav: ['Product', 'Market', 'Download', 'Security', 'Developers', 'Pricing'],
    signIn: 'Sign in',
    enter: 'Open console',
    heroKicker: 'Enterprise cloud agent platform',
    heroTitle: 'Run development, operations, data, and support work from one governed automation platform.',
    heroBody:
      'Tech-agent combines role configuration, knowledge, plugin permissions, cloud execution, task queues, and audit logs across web, Windows, and macOS clients.',
    primaryCta: 'Create workspace',
    secondaryCta: 'View architecture',
    liveProduct: 'Live product map',
    loginTitle: 'Email code sign-in',
    loginBody: 'Verify email first, connect AI APIs next, and run the real work in the cloud.',
    sendCode: 'Send code',
    verify: 'Verify and enter',
    email: 'Email',
    code: 'Code',
    org: 'Organization',
    api: 'API base',
    demoCode: 'Demo code',
    dashboard: 'Command',
    studio: 'Agent Studio',
    memory: 'Memory Lab',
    plugins: 'Plugin Cloud',
    computer: 'Cloud Computer',
    tasks: 'Task Center',
    settings: 'Settings',
  },
}

const publicViews: PublicView[] = ['product', 'market', 'download', 'security', 'developers', 'pricing']

const appViews: Array<{ id: AppView; icon: typeof LayoutDashboard }> = [
  { id: 'command', icon: LayoutDashboard },
  { id: 'studio', icon: Bot },
  { id: 'memory', icon: BrainCircuit },
  { id: 'plugins', icon: PackageCheck },
  { id: 'computer', icon: Cloud },
  { id: 'tasks', icon: Workflow },
  { id: 'settings', icon: Settings2 },
]

const industrySolutions = [
  { icon: Code2, title: 'Software Factory', zh: '代码、测试、PR、部署、故障修复和技术文档。' },
  { icon: Store, title: 'Commerce Ops', zh: '商品上架、竞品监控、客服回复、促销和订单分析。' },
  { icon: Database, title: 'Data Office', zh: '表格清洗、SQL、图表、日报、财务和商业分析。' },
  { icon: FileText, title: 'Document Studio', zh: '合同、PPT、PDF、报告、知识库和品牌文案。' },
  { icon: ShieldCheck, title: 'Security Desk', zh: '权限审批、审计、风险检查、密钥与合规策略。' },
  { icon: Users, title: 'Team Copilot', zh: '跨部门 AI 团队，自动分工、汇报、复盘和交付。' },
]

const personaGenes = [
  ['Execution', 'Autonomous', 92],
  ['Risk', 'Approval gated', 74],
  ['Tone', 'Direct and senior', 88],
  ['Creativity', 'High variance', 81],
  ['Memory', 'Project trained', 96],
  ['Cost', 'Balanced routing', 67],
]

const cloudComputerTiles = [
  { icon: Globe2, label: 'Browser', state: '4 sessions' },
  { icon: Command, label: 'Terminal', state: 'sandboxed' },
  { icon: Code2, label: 'Cloud IDE', state: 'branch ready' },
  { icon: UploadCloud, label: 'Files', state: '18 synced' },
  { icon: Database, label: 'Database', state: 'read-only' },
  { icon: Network, label: 'Replay', state: 'recording' },
]

const taskRows = [
  ['Build landing page', 'Designer + Builder', 'running', '73%'],
  ['Audit plugin permissions', 'Security', 'review', 'waiting'],
  ['Prepare GitHub release', 'Operator', 'queued', 'next'],
  ['Analyze pricing pages', 'Researcher', 'done', 'report'],
]

const commandButtons = [
  { icon: Search, label: 'Search web' },
  { icon: UploadCloud, label: 'Upload files' },
  { icon: PlugZap, label: 'Install plugin' },
  { icon: KeyRound, label: 'Connect API' },
]

const providerTemplates = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5',
    note: 'Reasoning, coding, multimodal work',
  },
  {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-opus',
    note: 'Writing, review, long-form planning',
  },
  {
    name: 'Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-pro',
    note: 'Research, long context, document analysis',
  },
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-reasoner',
    note: 'Cost-efficient reasoning and code',
  },
]

function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('tech-agent-theme', 'dark')
  const [locale, setLocale] = useLocalStorage<Locale>('tech-agent-locale', 'zh')
  const [session, setSession] = useLocalStorage<Session | null>('tech-agent-session', null)
  const [publicView, setPublicView] = useState<PublicView>('home')
  const [appView, setAppView] = useState<AppView>('command')
  const [authOpen, setAuthOpen] = useState(false)
  const [authStep, setAuthStep] = useState<'email' | 'code'>('email')
  const [sentCode, setSentCode] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeAgent, setActiveAgent] = useState(agentProfiles[0].name)
  const [prompt, setPrompt] = useState(
    '让 Designer、Builder、Operator、Security 四个 Agent 协作，把 Tech-agent 发布成可公开使用的网站。',
  )
  const t = copy[locale]

  const activeAgentProfile = useMemo(
    () => agentProfiles.find((agent) => agent.name === activeAgent) ?? agentProfiles[0],
    [activeAgent],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [theme, locale])

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || 'owner@tech-agent.dev')
    const organization = String(formData.get('organization') || 'Tech-agent Cloud')
    const apiBaseUrl = String(formData.get('apiBaseUrl') || '').trim()
    const code = String(formData.get('code') || '')

    try {
      if (authStep === 'email') {
        const result = await sendEmailCode({
          email,
          apiBaseUrl,
        })
        setSentCode(result.demoCode ?? 'sent')
        setAuthStep('code')
        return
      }

      const nextSession = await verifyEmailCode({
        email,
        code,
        organization,
        apiBaseUrl,
      })
      setSession(nextSession)
      setAuthOpen(false)
      setAuthStep('email')
      setSentCode('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Auth API failed')
    }
  }

  const shellActions = (
    <ControlStrip
      locale={locale}
      theme={theme}
      onLocale={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  )

  if (session) {
    return (
      <div className="os-shell">
        <aside className="os-rail">
          <button className="brand-mark" type="button" onClick={() => setSession(null)} aria-label="Back to site">
            <Sparkles size={21} />
          </button>
          <nav>
            {appViews.map((item) => {
              const Icon = item.icon
              return (
                <button
                  aria-label={item.id}
                  className={clsx('rail-button', appView === item.id && 'active')}
                  key={item.id}
                  title={labelForAppView(item.id, locale)}
                  type="button"
                  onClick={() => setAppView(item.id)}
                >
                  <Icon size={21} />
                </button>
              )
            })}
          </nav>
          {shellActions}
        </aside>
        <main className="os-main">
          <header className="os-topbar">
            <div className="os-title">
              <button className="icon-button" type="button" aria-label="Toggle sidebar">
                <PanelLeft size={18} />
              </button>
              <div>
                <span>{labelForAppView(appView, locale)}</span>
                <strong>{session.org}</strong>
              </div>
            </div>
            <div className="topbar-cluster">
              <span className="status-badge running">
                <Activity size={15} />
                cloud live
              </span>
              <button className="icon-button" type="button" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button className="user-button" type="button" onClick={() => setSession(null)}>
                <span>{session.user.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{session.user}</strong>
                  <small>{session.role}</small>
                </div>
              </button>
            </div>
          </header>
          <AppWorkspace
            activeAgent={activeAgent}
            activeAgentProfile={activeAgentProfile}
            appView={appView}
            locale={locale}
            prompt={prompt}
            session={session}
            onAgentChange={setActiveAgent}
            onPromptChange={setPrompt}
          />
        </main>
      </div>
    )
  }

  return (
    <main className="site-shell">
      <header className="site-nav">
        <button className="brand-lockup" type="button" onClick={() => setPublicView('home')}>
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          <span>
            <strong>Tech-agent</strong>
            <small>AI Workforce OS</small>
          </span>
        </button>
        <nav>
          {publicViews.map((view, index) => (
            <button
              className={clsx(publicView === view && 'active')}
              key={view}
              type="button"
              onClick={() => setPublicView(view)}
            >
              {t.nav[index]}
            </button>
          ))}
        </nav>
        <div className="nav-actions">
          {shellActions}
          <button className="ghost-button" type="button" onClick={() => setAuthOpen(true)}>
            {t.signIn}
          </button>
          <button className="primary-button" type="button" onClick={() => setAuthOpen(true)}>
            <Rocket size={18} />
            {t.enter}
          </button>
        </div>
      </header>

      <Hero locale={locale} t={t} onAuth={() => setAuthOpen(true)} onPublicView={setPublicView} />
      <PublicSection view={publicView} locale={locale} onAuth={() => setAuthOpen(true)} />
      <SiteFooter locale={locale} />

      {authOpen && (
        <AuthModal
          authError={authError}
          authStep={authStep}
          locale={locale}
          sentCode={sentCode}
          t={t}
          onClose={() => setAuthOpen(false)}
          onSubmit={handleAuth}
        />
      )}
    </main>
  )
}

function ControlStrip({
  locale,
  theme,
  onLocale,
  onTheme,
}: {
  locale: Locale
  theme: Theme
  onLocale: () => void
  onTheme: () => void
}) {
  return (
    <div className="control-strip">
      <button type="button" onClick={onLocale} aria-label="Switch language">
        <Languages size={17} />
        <span>{locale === 'zh' ? '中' : 'EN'}</span>
      </button>
      <button type="button" onClick={onTheme} aria-label="Switch theme">
        {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
      </button>
    </div>
  )
}

function Hero({
  locale,
  t,
  onAuth,
  onPublicView,
}: {
  locale: Locale
  t: (typeof copy)['zh']
  onAuth: () => void
  onPublicView: (view: PublicView) => void
}) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <span className="eyebrow">
          <WandSparkles size={15} />
          {t.heroKicker}
        </span>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroBody}</p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onAuth}>
            <Mail size={18} />
            {t.primaryCta}
          </button>
          <button className="ghost-button" type="button" onClick={() => onPublicView('developers')}>
            <Layers3 size={18} />
            {t.secondaryCta}
          </button>
        </div>
        <div className="hero-metrics">
          {productStats.map((stat) => {
            const Icon = stat.icon
            return (
              <article key={stat.label}>
                <Icon size={18} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            )
          })}
        </div>
      </div>
      <div className="hero-product">
        <div className="product-window">
          <div className="window-top">
            <span />
            <span />
            <span />
            <strong>{t.liveProduct}</strong>
          </div>
          <div className="command-map">
            <div className="map-header">
              <span className="status-badge running">
                <Activity size={15} />
                production workspace
              </span>
              <button type="button">
                <Command size={16} />
                K
              </button>
            </div>
            <div className="company-grid">
              {agentProfiles.slice(0, 6).map((agent) => (
                <article key={agent.name}>
                  <span className={clsx('agent-dot', agent.status)} />
                  <h3>{agent.name}</h3>
                  <p>{locale === 'zh' ? translateAgent(agent.name) : agent.role}</p>
                  <div>
                    <b>{agent.score}</b>
                    <small>{agent.model}</small>
                  </div>
                </article>
              ))}
            </div>
            <div className="cloud-computer-mini">
              {cloudComputerTiles.map((tile) => {
                const Icon = tile.icon
                return (
                  <div key={tile.label}>
                    <Icon size={17} />
                    <span>{tile.label}</span>
                    <strong>{tile.state}</strong>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PublicSection({
  view,
  locale,
  onAuth,
}: {
  view: PublicView
  locale: Locale
  onAuth: () => void
}) {
  if (view === 'market') {
    return (
      <section className="site-band">
        <SectionHeading
          eyebrow="Plugin Cloud"
          title={locale === 'zh' ? '插件市场按权限、审计和运行策略管理所有外部能力。' : 'A governed plugin marketplace for external capabilities.'}
          body={locale === 'zh' ? '每个插件都有权限、评分、安装量、安全等级、审计记录和人工审批策略。' : 'Every plugin carries permissions, scores, installs, trust level, audit logs, and approval rules.'}
        />
        <div className="plugin-market-grid">
          {plugins.map((plugin) => (
            <article className="market-card" key={plugin.name}>
              <div>
                <span>{plugin.category}</span>
                <strong>{plugin.trust}</strong>
              </div>
              <h3>{plugin.name}</h3>
              <p>{plugin.description}</p>
              <footer>
                <small>{plugin.installs} installs</small>
                <button type="button">{plugin.enabled ? 'Enabled' : 'Install'}</button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (view === 'download') {
    return (
      <section className="site-band">
        <SectionHeading
          eyebrow="Desktop + Web"
          title={locale === 'zh' ? '网页直接用，Windows 和 Mac 下载后也是真的客户端。' : 'Use it on the web, or install real Windows and Mac clients.'}
          body={locale === 'zh' ? '桌面端是云端账号的原生入口：快捷键、托盘、通知、拖拽上传和自动更新。' : 'Desktop clients are native cloud entry points with shortcuts, tray, notifications, uploads, and auto updates.'}
        />
        <div className="download-grid">
          {downloads.map((item) => (
            <article key={item.platform}>
              <PlatformIcon platform={item.platform} />
              <h3>{item.platform}</h3>
              <p>{item.file}</p>
              <div>
                <span>{item.status}</span>
                <strong>{item.size}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (view === 'security') {
    return (
      <section className="site-band security-layout">
        <SectionHeading
          eyebrow="Permission OS"
          title={locale === 'zh' ? '安全不是补丁，而是每个 Agent 的操作系统。' : 'Security is not a patch. It is the operating system for every agent.'}
          body={locale === 'zh' ? '沙箱、密钥金库、审批、审计、禁区、插件权限和任务回放默认启用。' : 'Sandboxes, vaults, approvals, audits, restricted zones, plugin scopes, and replay are built in.'}
        />
        <div className="security-grid">
          {[
            [ShieldCheck, 'Approval gates', 'Risky actions wait for human review.'],
            [LockKeyhole, 'Secret vault', 'Provider keys are scoped and encrypted.'],
            [Fingerprint, 'Audit trail', 'Every tool call is explainable.'],
            [HardDrive, 'Sandbox files', 'Cloud files stay workspace scoped.'],
          ].map(([Icon, title, body]) => {
            const TypedIcon = Icon as typeof ShieldCheck
            return (
              <article key={String(title)}>
                <TypedIcon size={22} />
                <h3>{title as string}</h3>
                <p>{body as string}</p>
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  if (view === 'developers') {
    return (
      <section className="site-band developer-layout">
        <SectionHeading
          eyebrow="Open-source platform"
          title={locale === 'zh' ? '给开发者的不只是 API，是可扩展的 Agent 生态。' : 'Developers get an extensible agent ecosystem, not only APIs.'}
          body={locale === 'zh' ? '插件 SDK、MCP 网关、Webhook、模型路由、工作流节点和云沙箱都可以扩展。' : 'Extend plugins, MCP gateways, webhooks, model routing, workflow nodes, and cloud sandboxes.'}
        />
        <div className="terminal-card">
          <div className="window-top">
            <span />
            <span />
            <span />
            <strong>ship.sh</strong>
          </div>
          <pre>{`npm run build
vercel --prod
git remote add origin https://github.com/sunguoyuan415-create/tech-agent.git
git push -u origin main`}</pre>
        </div>
      </section>
    )
  }

  if (view === 'pricing') {
    return (
      <section className="site-band">
        <SectionHeading
          eyebrow="Plans"
          title={locale === 'zh' ? '从个人工作区，到企业级自动化部门。' : 'From a personal workspace to an enterprise automation department.'}
          body={locale === 'zh' ? '价格页会支持 Free、Pro、Team、Enterprise，以及自带 API Key 模式。' : 'Pricing supports Free, Pro, Team, Enterprise, and bring-your-own-key mode.'}
        />
        <div className="pricing-grid">
          {['Free', 'Pro', 'Team', 'Enterprise'].map((plan, index) => (
            <article className={clsx(index === 2 && 'featured')} key={plan}>
              <h3>{plan}</h3>
              <strong>{index === 0 ? '$0' : index === 3 ? 'Custom' : `$${index * 19}`}</strong>
              <p>{locale === 'zh' ? '包含 Agent、插件、工作流、云任务和用量控制。' : 'Includes agents, plugins, workflows, cloud jobs, and usage controls.'}</p>
              <button type="button" onClick={onAuth}>Start</button>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="site-band">
      <SectionHeading
        eyebrow="Product System"
        title={locale === 'zh' ? 'Tech-agent 由五个企业系统组成，覆盖从接入到交付的完整流程。' : 'Tech-agent combines five enterprise systems from onboarding to delivery.'}
        body={locale === 'zh' ? '角色配置、知识管理、云端执行、插件治理和工作流编排共同组成一个可上线的企业级系统。' : 'Role configuration, knowledge, cloud execution, plugin governance, and workflow orchestration form a deployable enterprise system.'}
      />
      <div className="system-grid">
        {capabilities.map((capability) => {
          const Icon = capability.icon
          return (
            <article className={capability.accent} key={capability.title}>
              <Icon size={22} />
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          )
        })}
      </div>
      <div className="solution-grid">
        {industrySolutions.map((solution) => {
          const Icon = solution.icon
          return (
            <article key={solution.title}>
              <Icon size={22} />
              <h3>{solution.title}</h3>
              <p>{locale === 'zh' ? solution.zh : 'A prebuilt department playbook with agents, tools, workflows, and templates.'}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AppWorkspace({
  activeAgent,
  activeAgentProfile,
  appView,
  locale,
  prompt,
  session,
  onAgentChange,
  onPromptChange,
}: {
  activeAgent: string
  activeAgentProfile: (typeof agentProfiles)[number]
  appView: AppView
  locale: Locale
  prompt: string
  session: Session
  onAgentChange: (agent: string) => void
  onPromptChange: (prompt: string) => void
}) {
  const [connectedProviders, setConnectedProviders] = useState<ProviderConnection[]>([])
  const [providerMessage, setProviderMessage] = useState('')

  useEffect(() => {
    if (appView !== 'settings') {
      return
    }

    let cancelled = false
    listProviders(session)
      .then((result) => {
        if (!cancelled) {
          setConnectedProviders(result.providers)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setProviderMessage(error instanceof Error ? error.message : 'Provider API unavailable')
        }
      })

    return () => {
      cancelled = true
    }
  }, [appView, session])

  async function handleProviderConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProviderMessage('')
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)

    try {
      const provider = await connectProvider(session, {
        name: String(formData.get('name') || 'Custom Provider'),
        baseUrl: String(formData.get('baseUrl') || ''),
        model: String(formData.get('model') || ''),
        apiKey: String(formData.get('apiKey') || ''),
      })
      setConnectedProviders((current) => [provider, ...current])
      setProviderMessage('Provider connected and stored in the backend vault.')
      form.reset()
    } catch (error) {
      setProviderMessage(error instanceof Error ? error.message : 'Provider connection failed')
    }
  }

  if (appView === 'studio') {
    return (
      <div className="workspace-page">
        <StudioHeader locale={locale} />
        <div className="studio-layout">
          <section className="panel agent-roster">
            <PanelTitle icon={Bot} title="Role Library" action="New role" />
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
                  <small>{locale === 'zh' ? translateAgent(agent.name) : agent.role}</small>
                </div>
                <b>{agent.backlog}</b>
              </button>
            ))}
          </section>
          <section className="panel persona-panel">
            <PanelTitle icon={WandSparkles} title="Persona Genome" action="Train" />
            <div className="persona-card">
              <h2>{activeAgentProfile.name}</h2>
              <p>{locale === 'zh' ? translateAgent(activeAgentProfile.name) : activeAgentProfile.role}</p>
              <div className="tag-row">
                {activeAgentProfile.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
            <div className="gene-list">
              {personaGenes.map(([label, value, score]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <i style={{ width: `${score}%` }} />
                </div>
              ))}
            </div>
          </section>
          <section className="panel rules-panel">
            <PanelTitle icon={ShieldCheck} title="Behavior Rules" action="Save" />
            {[
              'Ask before spending money or publishing externally.',
              'Use Chinese for product planning and English for code comments.',
              'Prefer direct execution when confidence is high.',
              'Never expose provider keys in logs or artifacts.',
            ].map((rule) => (
              <label key={rule}>
                <input defaultChecked type="checkbox" />
                <span>{rule}</span>
              </label>
            ))}
          </section>
        </div>
      </div>
    )
  }

  if (appView === 'plugins') {
    return (
      <div className="workspace-page">
        <WorkspaceHero
          eyebrow="Plugin Cloud"
          title={locale === 'zh' ? '给团队工作区安装可审计的真实世界能力。' : 'Install auditable real-world capabilities into the workspace.'}
          action="Review permissions"
        />
        <div className="plugin-market-grid in-app">
          {plugins.map((plugin) => (
            <article className="market-card" key={plugin.name}>
              <div>
                <span>{plugin.category}</span>
                <strong>{plugin.trust}</strong>
              </div>
              <h3>{plugin.name}</h3>
              <p>{plugin.description}</p>
              <footer>
                <small>{plugin.installs} installs</small>
                <button type="button">{plugin.enabled ? 'Enabled' : 'Install'}</button>
              </footer>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (appView === 'computer') {
    return (
      <div className="workspace-page">
        <WorkspaceHero
          eyebrow="Cloud Computer"
          title={locale === 'zh' ? '每个 Agent 都有独立云电脑，执行环境、文件和回放全部托管。' : 'Every agent gets a hosted cloud computer with execution, files, and replay.'}
          action="Open remote desktop"
        />
        <div className="computer-layout">
          <section className="browser-frame">
            <div className="window-top">
              <span />
              <span />
              <span />
              <strong>remote-browser.builder.tech-agent</strong>
            </div>
            <div className="browser-body">
              <div className="fake-address">https://github.com/new</div>
              <div className="fake-page">
                <h3>Create a new repository</h3>
                <p>Agent is preparing the open-source release with approval gate.</p>
                <button type="button">Awaiting approval</button>
              </div>
            </div>
          </section>
          <section className="panel computer-tools">
            <PanelTitle icon={Cloud} title="Resources" action="Policy" />
            {cloudComputerTiles.map((tile) => {
              const Icon = tile.icon
              return (
                <div key={tile.label}>
                  <Icon size={18} />
                  <span>{tile.label}</span>
                  <strong>{tile.state}</strong>
                </div>
              )
            })}
          </section>
        </div>
      </div>
    )
  }

  if (appView === 'tasks') {
    return (
      <div className="workspace-page">
        <WorkspaceHero
          eyebrow="Task Center"
          title={locale === 'zh' ? '所有 AI 工作都变成可恢复、可审批、可重跑的任务。' : 'Every AI action becomes resumable, approvable, replayable work.'}
          action="Create workflow"
        />
        <section className="panel task-table">
          {taskRows.map(([task, owner, state, progress]) => (
            <div key={task}>
              <strong>{task}</strong>
              <span>{owner}</span>
              <em className={state}>{state}</em>
              <b>{progress}</b>
            </div>
          ))}
        </section>
        <section className="workflow-line">
          {workflowNodes.map((node, index) => (
            <article className={node.state} key={node.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{node.title}</h3>
              <p>{node.meta}</p>
            </article>
          ))}
        </section>
      </div>
    )
  }

  if (appView === 'memory') {
    return (
      <div className="workspace-page">
        <WorkspaceHero
          eyebrow="Memory Lab"
          title={
            locale === 'zh'
              ? '上传资料、示例和偏好，让 Agent 逐渐像你的团队成员。'
              : 'Upload knowledge, examples, and preferences so agents learn your team.'
          }
          action="Upload corpus"
        />
        <div className="ops-grid">
          {[...providers, ...productStats.slice(0, 2)].map((item) => (
            <article className="ops-card" key={'name' in item ? item.name : item.label}>
              <span>{'name' in item ? item.name : item.label}</span>
              <strong>{'latency' in item ? item.latency : item.value}</strong>
              <p>{'route' in item ? item.route : 'Cloud usage and operating signal.'}</p>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (appView === 'settings') {
    return (
      <div className="workspace-page">
        <WorkspaceHero
          eyebrow="Model Gateway"
          title={
            locale === 'zh'
              ? '把真实 AI API 接进来：模型、密钥、路由、成本和权限统一管理。'
              : 'Connect real AI APIs: models, keys, routing, cost, and policy in one control plane.'
          }
          action="Save gateway"
        />
        <ProviderWizard
          locale={locale}
          message={providerMessage}
          providers={connectedProviders}
          session={session}
          onSubmit={handleProviderConnect}
        />
      </div>
    )
  }

  return (
    <div className="workbench">
      <section className="command-panel">
        <div className="command-head">
          <span className="status-badge running">
            <Sparkles size={15} />
            {activeAgentProfile.name}
          </span>
          <span>{activeAgentProfile.model}</span>
          <span>{session.email}</span>
        </div>
        <textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} />
        <div className="command-actions">
          {commandButtons.map(({ icon: Icon, label }) => {
            return (
              <button key={label} type="button">
                <Icon size={16} />
                {label}
              </button>
            )
          })}
          <button className="primary-button" type="button">
            <Send size={18} />
            Run workforce
          </button>
        </div>
      </section>
      <section className="workbench-grid">
        <div className="panel">
          <PanelTitle icon={Bot} title="AI Company" action="Hire" />
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
                  <small>{locale === 'zh' ? translateAgent(agent.name) : agent.role}</small>
                </div>
                <b>{agent.backlog}</b>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <PanelTitle icon={Activity} title="Live Timeline" action="Replay" />
          <div className="timeline-list">
            {taskRows.map(([task, owner, state]) => (
              <article key={task}>
                <span className={state} />
                <div>
                  <strong>{task}</strong>
                  <p>{owner}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <PanelTitle icon={Cpu} title="Cloud Runtime" action="Scale" />
          <div className="runtime-stack">
            {cloudComputerTiles.map((tile) => {
              const Icon = tile.icon
              return (
                <div key={tile.label}>
                  <Icon size={18} />
                  <span>{tile.label}</span>
                  <strong>{tile.state}</strong>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function AuthModal({
  authError,
  authStep,
  locale,
  sentCode,
  t,
  onClose,
  onSubmit,
}: {
  authError: string
  authStep: 'email' | 'code'
  locale: Locale
  sentCode: string
  t: (typeof copy)['zh']
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const defaultApiBaseUrl = getDefaultApiBaseUrl()

  return (
    <div className="modal-backdrop">
      <section className="auth-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow">
          <Mail size={15} />
          {t.loginTitle}
        </span>
        <h2>{locale === 'zh' ? '登录后创建工作区并接入模型服务。' : 'Sign in to create a workspace and connect model services.'}</h2>
        <p>{t.loginBody}</p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            {t.email}
            <input name="email" type="email" defaultValue="owner@tech-agent.dev" />
          </label>
          <label>
            {t.org}
            <input name="organization" defaultValue="Tech-agent Cloud" />
          </label>
          <label>
            {t.api}
            <input name="apiBaseUrl" defaultValue={defaultApiBaseUrl} placeholder="/api" />
          </label>
          {authStep === 'code' && (
            <label>
              {t.code}
              <input name="code" defaultValue={sentCode === 'sent' ? '' : sentCode} inputMode="numeric" placeholder="246810" />
            </label>
          )}
          {sentCode && <div className="demo-code">{t.demoCode}: {sentCode}</div>}
          {authError && <div className="form-error">{authError}</div>}
          <button className="primary-button" type="submit">
            <KeyRound size={18} />
            {authStep === 'email' ? t.sendCode : t.verify}
          </button>
        </form>
      </section>
    </div>
  )
}

function ProviderWizard({
  locale,
  message,
  providers,
  session,
  onSubmit,
}: {
  locale: Locale
  message: string
  providers: ProviderConnection[]
  session: Session
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="provider-layout">
      <section className="panel provider-wizard">
        <PanelTitle icon={KeyRound} title="AI API Onboarding" action="Backend vault" />
        <div className="gateway-status">
          <div>
            <span>Backend</span>
            <strong>{session.apiBaseUrl || 'demo mode'}</strong>
          </div>
          <div>
            <span>Session</span>
            <strong>{session.token.slice(0, 8)}...</strong>
          </div>
          <div>
            <span>Org</span>
            <strong>{session.org}</strong>
          </div>
        </div>
        <form className="provider-form" onSubmit={onSubmit}>
          <label>
            Provider
            <input name="name" defaultValue="OpenAI" />
          </label>
          <label>
            Base URL
            <input name="baseUrl" defaultValue="https://api.openai.com/v1" />
          </label>
          <label>
            Default model
            <input name="model" defaultValue="gpt-5" />
          </label>
          <label>
            API key
            <input name="apiKey" type="password" placeholder="sk-..." />
          </label>
          {message && <div className="demo-code">{message}</div>}
          <button className="primary-button" type="submit">
            <KeyRound size={18} />
            {locale === 'zh' ? '接入并保存到后端' : 'Connect and save'}
          </button>
        </form>
      </section>

      <section className="panel provider-list-panel">
        <PanelTitle icon={BrainCircuit} title="Provider presets" action="Route policy" />
        <div className="provider-template-grid">
          {providerTemplates.map((template) => (
            <article key={template.name}>
              <strong>{template.name}</strong>
              <span>{template.model}</span>
              <p>{template.note}</p>
              <small>{template.baseUrl}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel provider-list-panel">
        <PanelTitle icon={ShieldCheck} title="Connected vault" action="Audit" />
        <div className="connected-list">
          {providers.map((provider) => (
            <article key={provider.id}>
              <div>
                <strong>{provider.name}</strong>
                <span>{provider.model}</span>
              </div>
              <small>{provider.keyPreview}</small>
              <em>{provider.status}</em>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}

function WorkspaceHero({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return (
    <section className="workspace-hero">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <button className="primary-button" type="button">
        <ChevronRight size={18} />
        {action}
      </button>
    </section>
  )
}

function StudioHeader({ locale }: { locale: Locale }) {
  return (
    <WorkspaceHero
      eyebrow="Persona Genome"
      title={
        locale === 'zh'
          ? '像培养员工一样调教 AI：角色、性格、记忆、禁区、示例和评分。'
          : 'Train AI like employees: roles, traits, memory, limits, examples, and scores.'
      }
      action="Train profile"
    />
  )
}

function PanelTitle({ icon: Icon, title, action }: { icon: typeof Bot; title: string; action: string }) {
  return (
    <div className="panel-title">
      <div>
        <Icon size={18} />
        <strong>{title}</strong>
      </div>
      <button type="button">{action}</button>
    </div>
  )
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform.includes('macOS')) return <Apple size={24} />
  if (platform.includes('Windows')) return <Laptop size={24} />
  if (platform.includes('Docker')) return <HardDrive size={24} />
  return <Globe2 size={24} />
}

function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="brand-lockup">
        <span className="brand-mark">
          <Sparkles size={20} />
        </span>
        <span>
          <strong>Tech-agent</strong>
          <small>AI Workforce OS</small>
        </span>
      </div>
      <p>
        {locale === 'zh'
          ? '开源、云端、可下载、可扩展的企业 Agent 平台。'
          : 'Open-source, cloud-first, downloadable, extensible AI workforce operating system.'}
      </p>
      <div>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          <GitBranch size={17} />
          GitHub
        </a>
        <a href="#download">
          <Download size={17} />
          Downloads
        </a>
      </div>
    </footer>
  )
}

function labelForAppView(view: AppView, locale: Locale) {
  const labels: Record<AppView, { zh: string; en: string }> = {
    command: { zh: '控制中心', en: 'Command' },
    studio: { zh: 'Agent Studio', en: 'Agent Studio' },
    memory: { zh: '记忆实验室', en: 'Memory Lab' },
    plugins: { zh: '插件云', en: 'Plugin Cloud' },
    computer: { zh: '云电脑', en: 'Cloud Computer' },
    tasks: { zh: '任务中心', en: 'Task Center' },
    settings: { zh: '设置', en: 'Settings' },
  }
  return labels[view][locale]
}

function translateAgent(name: string) {
  const labels: Record<string, string> = {
    Builder: '写代码、测试、修复、发布',
    Researcher: '搜索资料、引用来源、生成结论',
    Operator: '操作网页、处理邮件、调用 API',
    Analyst: '分析数据、生成报表、建立模型',
    Designer: '设计界面、检查布局、建立设计系统',
    Tutor: '学习用户风格、沉淀偏好、辅导执行',
  }
  return labels[name] ?? '云端 Agent'
}

export default App
