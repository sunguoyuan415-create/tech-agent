import crypto from 'node:crypto'
import { handleCors, maskKey, readSession, sendError, verifyProviderKey } from './_lib/auth.js'

const defaultProviders = [
  {
    id: 'openai-default',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5',
    keyPreview: 'not connected',
    status: 'needs_key',
  },
  {
    id: 'anthropic-default',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-opus',
    keyPreview: 'not connected',
    status: 'needs_key',
  },
  {
    id: 'gemini-default',
    name: 'Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-pro',
    keyPreview: 'not connected',
    status: 'needs_key',
  },
]

export default async function handler(request, response) {
  if (handleCors(request, response)) return

  try {
    readSession(request.headers.authorization)

    if (request.method === 'GET') {
      response.status(200).json({ providers: defaultProviders })
      return
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST')
      response.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { name = 'Custom Provider', baseUrl = '', model = '', apiKey = '' } = request.body ?? {}
    const keyCheck = await verifyProviderKey({ name, baseUrl, apiKey })

    response.status(201).json({
      id: `provider_${crypto.randomUUID()}`,
      name,
      baseUrl,
      model,
      keyPreview: maskKey(String(apiKey)),
      status: keyCheck.verified ? 'connected' : 'needs_key',
      checkedUrl: keyCheck.checkedUrl,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    sendError(response, error)
  }
}
