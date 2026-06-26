const CLIENT_ID_KEY = 'lingxige_client_id'

function createClientId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `client_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function getClientId() {
  try {
    const cachedClientId = window.localStorage.getItem(CLIENT_ID_KEY)

    if (cachedClientId) {
      return cachedClientId
    }

    const clientId = createClientId()
    window.localStorage.setItem(CLIENT_ID_KEY, clientId)
    return clientId
  } catch {
    return createClientId()
  }
}
