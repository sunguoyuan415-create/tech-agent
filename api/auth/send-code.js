import { createVerificationChallenge, handleCors, normalizeEmail, sendError, sendVerificationEmail } from '../_lib/auth.js'

export default function handler(request, response) {
  if (handleCors(request, response)) return

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  return handleSendCode(request, response)
}

async function handleSendCode(request, response) {
  try {
    const email = normalizeEmail(request.body?.email)
    if (!email) {
      response.status(400).json({ error: 'Email is required' })
      return
    }

    const challenge = createVerificationChallenge(email)
    await sendVerificationEmail({ email, code: challenge.code })

    response.status(200).json({
      email,
      sent: true,
      expiresIn: challenge.expiresIn,
      verificationId: challenge.verificationId,
      delivery: 'email',
    })
  } catch (error) {
    sendError(response, error)
  }
}
