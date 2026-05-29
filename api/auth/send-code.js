export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { email = 'owner@tech-agent.dev' } = request.body ?? {}

  response.status(200).json({
    email,
    sent: true,
    expiresIn: 600,
    demoCode: '246810',
  })
}
