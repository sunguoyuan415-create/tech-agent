import { createSession, handleCors, sendError, verifyEmailChallenge } from '../_lib/auth.js'

export default function handler(request, response) {
  if (handleCors(request, response)) return

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const {
      code = '',
      email = '',
      organization = 'Tech-agent Cloud',
      apiBaseUrl = '',
      verificationId = '',
    } = request.body ?? {}

    verifyEmailChallenge({ email, code, verificationId })
    const session = createSession({ email, organization, apiBaseUrl })

    response.status(200).json(session)
  } catch (error) {
    sendError(response, error)
  }
}
