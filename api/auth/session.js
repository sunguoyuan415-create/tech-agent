import { handleCors, readSession, sendError } from '../_lib/auth.js'

export default function handler(request, response) {
  if (handleCors(request, response)) return

  try {
    const session = readSession(request.headers.authorization)

    response.status(200).json({
      authenticated: true,
      ...session,
      workspaceId: 'main',
      features: ['agents', 'workflows', 'plugins', 'downloads', 'admin'],
    })
  } catch (error) {
    sendError(response, error)
  }
}
