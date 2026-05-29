import { createSession, handleCors, normalizeEmail, sendError } from '../_lib/auth.js'

export default function handler(request, response) {
  if (handleCors(request, response)) return

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { email = '', organization = 'Tech-agent Cloud', apiBaseUrl = '' } = request.body ?? {}
    if (!normalizeEmail(email)) {
      response.status(400).json({ error: 'Email is required' })
      return
    }

    response.status(200).json(createSession({ email, organization, apiBaseUrl }))
  } catch (error) {
    sendError(response, error)
  }
}
