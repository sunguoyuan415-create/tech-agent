export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { email = 'owner@tech-agent.dev', organization = 'Tech-agent Cloud' } = request.body ?? {}
  const user = String(email).split('@')[0] || 'owner'

  response.status(200).json({
    user,
    email,
    org: organization,
    role: 'Owner',
    token: `demo_${crypto.randomUUID()}`,
  })
}
