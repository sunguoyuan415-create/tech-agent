export default function handler(request, response) {
  const { id = 'run_demo' } = request.query ?? {}

  response.status(200).json({
    id,
    events: [
      {
        time: new Date().toISOString(),
        actor: 'Runtime',
        event: 'Run accepted by Tech-agent serverless API.',
        state: 'done',
      },
      {
        time: new Date().toISOString(),
        actor: 'Tool Bus',
        event: 'Awaiting approved cloud tools and provider keys.',
        state: 'queued',
      },
    ],
  })
}
