import { handleCors, readSession, sendError } from '../../../_lib/auth.js'

export default function handler(request, response) {
  if (handleCors(request, response)) return

  try {
    readSession(request.headers.authorization)
    const { id = 'run' } = request.query ?? {}

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
  } catch (error) {
    sendError(response, error)
  }
}
