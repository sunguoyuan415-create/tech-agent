export default function handler(request, response) {
  const token = request.headers.authorization?.replace('Bearer ', '') || ''

  response.status(200).json({
    authenticated: Boolean(token),
    user: 'owner',
    email: 'owner@tech-agent.dev',
    org: 'Tech-agent Cloud',
    role: 'Owner',
    workspaceId: 'main',
    features: ['agents', 'workflows', 'plugins', 'downloads', 'admin'],
  })
}
