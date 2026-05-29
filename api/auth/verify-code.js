export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code = '', email = 'owner@tech-agent.dev', organization = 'Tech-agent Cloud' } = request.body ?? {}

  if (String(code) !== '246810') {
    response.status(401).json({ error: 'Invalid code' })
    return
  }

  response.status(200).json({
    user: String(email).split('@')[0] || 'owner',
    email,
    org: organization,
    role: 'Owner',
    token: `code_${crypto.randomUUID()}`,
  })
}
