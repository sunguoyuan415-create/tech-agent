import {
  Apple,
  Bot,
  BrainCircuit,
  Building2,
  Cloud,
  Code2,
  Cpu,
  Database,
  Download,
  Eye,
  FileCode2,
  FileText,
  Fingerprint,
  GitBranch,
  Globe2,
  HardDrive,
  KeyRound,
  Laptop,
  Layers3,
  LockKeyhole,
  Mail,
  MessageSquareText,
  MonitorDown,
  Network,
  Play,
  PlugZap,
  Rocket,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Store,
  UploadCloud,
  Users,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'
import type {
  AgentProfile,
  Artifact,
  AuditItem,
  Capability,
  DownloadBuild,
  Plugin,
  Provider,
  RunEvent,
  ToolItem,
  WorkflowNode,
} from '../types/product'

export const capabilities: Capability[] = [
  {
    title: 'Cloud Agent Runtime',
    description: 'Remote browser, code execution, file work, API calls, and recoverable long jobs.',
    accent: 'cyan',
    icon: Cloud,
  },
  {
    title: 'Universal Tool Bus',
    description: 'Search, terminal, GitHub, databases, docs, sheets, slides, mail, and webhooks.',
    accent: 'green',
    icon: PlugZap,
  },
  {
    title: 'Multi-model Router',
    description: 'OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter, Azure, and custom gateways.',
    accent: 'blue',
    icon: BrainCircuit,
  },
  {
    title: 'Enterprise Control',
    description: 'Roles, audit logs, encrypted API vaults, sandbox policies, and approval gates.',
    accent: 'amber',
    icon: ShieldCheck,
  },
  {
    title: 'Workflow Studio',
    description: 'Node workflows, human review, schedules, webhooks, and reusable templates.',
    accent: 'rose',
    icon: Workflow,
  },
]

export const agentProfiles: AgentProfile[] = [
  {
    name: 'Builder',
    role: 'Codes, tests, patches, ships',
    status: 'running',
    model: 'GPT-5 Thinking',
    score: '99.2%',
    tools: ['repo', 'terminal', 'browser', 'docs'],
    backlog: 7,
  },
  {
    name: 'Researcher',
    role: 'Finds facts and cites sources',
    status: 'ready',
    model: 'Gemini 2.5 Pro',
    score: '97.8%',
    tools: ['web', 'pdf', 'tables'],
    backlog: 3,
  },
  {
    name: 'Operator',
    role: 'Runs cloud automations',
    status: 'review',
    model: 'Claude Opus',
    score: '96.4%',
    tools: ['browser', 'email', 'calendar', 'api'],
    backlog: 11,
  },
  {
    name: 'Analyst',
    role: 'Models data and dashboards',
    status: 'ready',
    model: 'GPT-5 Mini',
    score: '98.9%',
    tools: ['sql', 'sheets', 'charts'],
    backlog: 4,
  },
  {
    name: 'Designer',
    role: 'Designs interfaces and product systems',
    status: 'ready',
    model: 'Claude Sonnet',
    score: '96.9%',
    tools: ['figma', 'tokens', 'screenshots'],
    backlog: 6,
  },
  {
    name: 'Tutor',
    role: 'Learns user style and coaches tasks',
    status: 'paused',
    model: 'GPT-5 Mini',
    score: '95.8%',
    tools: ['memory', 'voice', 'notes'],
    backlog: 2,
  },
]

export const providers: Provider[] = [
  {
    name: 'OpenAI',
    status: 'connected',
    latency: '612 ms',
    cost: '$18.40',
    route: 'reasoning, code, vision',
  },
  {
    name: 'Anthropic',
    status: 'missing',
    latency: 'n/a',
    cost: '$0.00',
    route: 'writing, review',
  },
  {
    name: 'Gemini',
    status: 'connected',
    latency: '744 ms',
    cost: '$5.12',
    route: 'research, long context',
  },
  {
    name: 'Custom Gateway',
    status: 'degraded',
    latency: '1.8 s',
    cost: '$2.71',
    route: 'enterprise policy',
  },
]

export const workflowNodes: WorkflowNode[] = [
  {
    title: 'Intent Router',
    kind: 'classifier',
    state: 'complete',
    meta: 'Matched software build request',
  },
  {
    title: 'Plan Generator',
    kind: 'reasoning',
    state: 'complete',
    meta: '15-step product plan',
  },
  {
    title: 'Cloud Sandbox',
    kind: 'runtime',
    state: 'active',
    meta: 'React app build in progress',
  },
  {
    title: 'Human Approval',
    kind: 'review',
    state: 'waiting',
    meta: 'Publish GitHub release',
  },
  {
    title: 'Release Pipeline',
    kind: 'deploy',
    state: 'waiting',
    meta: 'Vercel, Docker, desktop bundles',
  },
]

export const tools: ToolItem[] = [
  {
    name: 'Remote Browser',
    description: 'Cloud Chrome with click, type, scrape, screenshot, and session replay.',
    permission: 'Review',
    icon: Globe2,
  },
  {
    name: 'Code Runner',
    description: 'Ephemeral Linux runners for tests, builds, scripts, and package installs.',
    permission: 'Auto',
    icon: Code2,
  },
  {
    name: 'GitHub Publisher',
    description: 'Creates repos, issues, releases, pull requests, and changelog entries.',
    permission: 'Review',
    icon: GitBranch,
  },
  {
    name: 'Data Lab',
    description: 'SQL, CSV, spreadsheets, charts, notebooks, and scheduled reports.',
    permission: 'Auto',
    icon: Database,
  },
  {
    name: 'Secure Vault',
    description: 'Encrypts provider keys, webhook secrets, and organization tokens.',
    permission: 'Locked',
    icon: LockKeyhole,
  },
  {
    name: 'Document Factory',
    description: 'Generates docs, PDFs, decks, briefs, invoices, and release notes.',
    permission: 'Auto',
    icon: FileText,
  },
]

export const runEvents: RunEvent[] = [
  {
    time: '17:28',
    actor: 'Planner',
    event: 'Converted the complete product request into platform modules.',
    state: 'done',
  },
  {
    time: '17:31',
    actor: 'Builder',
    event: 'Created React + TypeScript web application.',
    state: 'done',
  },
  {
    time: '17:34',
    actor: 'Runtime',
    event: 'Installing UI dependencies and writing the agent workbench.',
    state: 'live',
  },
  {
    time: '17:40',
    actor: 'Release',
    event: 'Prepare GitHub, Docker, Vercel, and desktop packaging docs.',
    state: 'queued',
  },
]

export const artifacts: Artifact[] = [
  {
    name: 'tech-agent-web.zip',
    type: 'web build',
    size: '2.4 MB',
    status: 'Draft',
  },
  {
    name: 'Tech-Agent-Setup.exe',
    type: 'Windows',
    size: '142 MB',
    status: 'Draft',
  },
  {
    name: 'Tech-Agent-arm64.dmg',
    type: 'macOS',
    size: '118 MB',
    status: 'Draft',
  },
  {
    name: 'api-openapi.json',
    type: 'API spec',
    size: '84 KB',
    status: 'Synced',
  },
]

export const downloads: DownloadBuild[] = [
  {
    platform: 'Windows Installer',
    file: 'Tech-agent_1.0.7_x64-setup.exe',
    url: 'https://github.com/sunguoyuan415-create/tech-agent/releases/download/v1.0.7/Tech-agent_1.0.7_x64-setup.exe',
    status: 'Release ready',
    size: '1.9 MB',
  },
  {
    platform: 'Windows MSI',
    file: 'Tech-agent_1.0.7_x64_en-US.msi',
    url: 'https://github.com/sunguoyuan415-create/tech-agent/releases/download/v1.0.7/Tech-agent_1.0.7_x64_en-US.msi',
    status: 'Release ready',
    size: '2.9 MB',
  },
  {
    platform: 'macOS Universal',
    file: 'Tech-agent_1.0.7_universal.dmg',
    url: 'https://github.com/sunguoyuan415-create/tech-agent/releases/download/v1.0.7/Tech-agent_1.0.7_universal.dmg',
    status: 'Release ready',
    size: '6.0 MB',
  },
  {
    platform: 'macOS App Archive',
    file: 'Tech-agent_universal.app.tar.gz',
    url: 'https://github.com/sunguoyuan415-create/tech-agent/releases/download/v1.0.7/Tech-agent_universal.app.tar.gz',
    status: 'Release ready',
    size: '5.8 MB',
  },
  {
    platform: 'Web App',
    file: 'https://sunguoyuan415-create.github.io/tech-agent',
    url: 'https://sunguoyuan415-create.github.io/tech-agent',
    status: 'Release ready',
    size: 'cloud',
  },
]

export const plugins: Plugin[] = [
  {
    name: 'GitHub Engineer',
    category: 'Development',
    installs: '48k',
    trust: 'Verified',
    enabled: true,
    description: 'Issue triage, PR review, release notes, repository creation, and CI repair.',
  },
  {
    name: 'Browser Operator',
    category: 'Automation',
    installs: '61k',
    trust: 'Verified',
    enabled: true,
    description: 'Cloud browser automation with form fills, screenshots, scraping, and replay.',
  },
  {
    name: 'Finance Analyst',
    category: 'Data',
    installs: '19k',
    trust: 'Reviewed',
    enabled: false,
    description: 'Portfolio summaries, market monitors, spreadsheets, and report generation.',
  },
  {
    name: 'Mailroom',
    category: 'Communication',
    installs: '22k',
    trust: 'Reviewed',
    enabled: true,
    description: 'Email summaries, replies, approvals, and scheduled outbound updates.',
  },
  {
    name: 'Docs Studio',
    category: 'Documents',
    installs: '35k',
    trust: 'Verified',
    enabled: true,
    description: 'Word, PDF, slides, changelogs, specs, contracts, and knowledge-base publishing.',
  },
  {
    name: 'MCP Gateway',
    category: 'Platform',
    installs: '17k',
    trust: 'Verified',
    enabled: false,
    description: 'Connects MCP servers, custom tools, internal APIs, and permission policies.',
  },
  {
    name: 'Cloud IDE',
    category: 'Development',
    installs: '52k',
    trust: 'Verified',
    enabled: true,
    description: 'VS Code-style cloud workspaces, branches, terminals, tests, previews, and deploy hooks.',
  },
  {
    name: 'Browser Fleet',
    category: 'Automation',
    installs: '44k',
    trust: 'Verified',
    enabled: true,
    description: 'Parallel remote browsers, account profiles, captchas handoff, replay, and extraction jobs.',
  },
  {
    name: 'Knowledge Trainer',
    category: 'Memory',
    installs: '28k',
    trust: 'Verified',
    enabled: true,
    description: 'Uploads docs, chats, policies, brand voice, examples, and turns them into agent memory.',
  },
  {
    name: 'Voice Desk',
    category: 'Communication',
    installs: '14k',
    trust: 'Reviewed',
    enabled: false,
    description: 'Voice notes, meeting summaries, call briefs, spoken commands, and multilingual dictation.',
  },
  {
    name: 'CRM Operator',
    category: 'Business',
    installs: '23k',
    trust: 'Reviewed',
    enabled: false,
    description: 'Salesforce, HubSpot, customer research, follow-ups, pipeline updates, and deal notes.',
  },
  {
    name: 'DevOps Sentinel',
    category: 'Infrastructure',
    installs: '31k',
    trust: 'Verified',
    enabled: true,
    description: 'Logs, incidents, deploys, rollbacks, status pages, alerts, and runbook execution.',
  },
  {
    name: 'Design Reviewer',
    category: 'Design',
    installs: '18k',
    trust: 'Reviewed',
    enabled: true,
    description: 'Screenshot QA, responsive checks, accessibility notes, typography, and layout critiques.',
  },
  {
    name: 'Legal Draft',
    category: 'Documents',
    installs: '11k',
    trust: 'Locked',
    enabled: false,
    description: 'Contract drafts, redlines, policies, intake forms, and approval-only legal workflows.',
  },
]

export const auditItems: AuditItem[] = [
  {
    time: '17:05',
    user: 'owner@tech-agent.dev',
    action: 'Rotated OpenAI project key',
    risk: 'Low',
  },
  {
    time: '16:42',
    user: 'ops@tech-agent.dev',
    action: 'Approved browser checkout workflow',
    risk: 'Medium',
  },
  {
    time: '15:18',
    user: 'admin@tech-agent.dev',
    action: 'Blocked plugin without sandbox declaration',
    risk: 'High',
  },
  {
    time: '14:56',
    user: 'builder@tech-agent.dev',
    action: 'Published workflow template',
    risk: 'Low',
  },
]

export const productStats = [
  { label: 'Cloud tasks', value: '18,420', icon: Server },
  { label: 'Tool calls', value: '2.9M', icon: Wrench },
  { label: 'Workflows', value: '412', icon: Workflow },
  { label: 'Teams', value: '86', icon: Building2 },
]

export const docsSections = [
  {
    title: 'API authentication',
    icon: KeyRound,
    lines: ['POST /auth/login', 'POST /auth/oauth/github', 'GET /auth/session'],
  },
  {
    title: 'Agent runs',
    icon: Bot,
    lines: ['POST /agent/runs', 'GET /agent/runs/:id/events', 'POST /agent/runs/:id/approve'],
  },
  {
    title: 'Workflow engine',
    icon: Workflow,
    lines: ['POST /workflows', 'POST /workflows/:id/execute', 'GET /workflow-runs/:id'],
  },
  {
    title: 'Files and artifacts',
    icon: UploadCloud,
    lines: ['POST /files/upload', 'GET /artifacts/:id', 'POST /artifacts/:id/share'],
  },
]

export const commandActions = [
  { label: 'Run cloud agent', icon: Play },
  { label: 'Search web', icon: Search },
  { label: 'Upload file', icon: UploadCloud },
  { label: 'Connect API', icon: KeyRound },
]

export const platformBadges = [
  { label: 'Windows', icon: Laptop },
  { label: 'macOS', icon: Apple },
  { label: 'Web', icon: Globe2 },
  { label: 'Docker', icon: HardDrive },
]

export const adminTiles = [
  { label: 'SSO domains', value: '4', icon: Fingerprint },
  { label: 'Active seats', value: '128', icon: Users },
  { label: 'Policies', value: '32', icon: ShieldCheck },
  { label: 'Cost guardrails', value: '$4.2k', icon: Settings2 },
]

export const heroVisualRows = [
  { label: 'browser', value: 'ready', icon: Eye },
  { label: 'terminal', value: 'live', icon: MonitorDown },
  { label: 'messages', value: '2.1k', icon: MessageSquareText },
  { label: 'deploy', value: 'armed', icon: Rocket },
  { label: 'network', value: 'sealed', icon: Network },
  { label: 'compute', value: '8x', icon: Cpu },
  { label: 'files', value: 'synced', icon: FileCode2 },
  { label: 'mail', value: 'queued', icon: Mail },
  { label: 'automation', value: 'hot', icon: Zap },
  { label: 'market', value: 'open', icon: Store },
  { label: 'download', value: 'signed', icon: Download },
  { label: 'layers', value: 'cloud', icon: Layers3 },
]
