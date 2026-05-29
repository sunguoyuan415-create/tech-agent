const runEvents = [
  {
    time: '17:28',
    actor: 'Planner',
    event: 'Intent parsed and assigned to Builder, Researcher, Operator, and Analyst.',
    state: 'done',
  },
  {
    time: '17:31',
    actor: 'Builder',
    event: 'Generated product structure, web UI, docs, and release configuration.',
    state: 'done',
  },
  {
    time: '17:34',
    actor: 'Runtime',
    event: 'Queued cloud execution with approval gates for GitHub publishing.',
    state: 'live',
  },
]

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { prompt = '', modelProvider = 'openai', workspaceId = 'main' } = request.body ?? {}
  const id = `run_${crypto.randomUUID()}`

  response.status(202).json({
    id,
    status: 'queued',
    workspaceId,
    modelProvider,
    prompt,
    eventsUrl: `/api/agent/runs/${id}/events`,
    events: runEvents,
  })
}
