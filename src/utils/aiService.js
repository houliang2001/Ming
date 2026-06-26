import { getClientId } from './clientId'

export class AiServiceError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'AiServiceError'
    this.status = options.status || 0
    this.code = options.code || 'AI_SERVICE_ERROR'
    this.imageQuality = options.imageQuality || ''
    this.payload = options.payload || null
  }
}

async function parseResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function createNetworkError(error) {
  return new AiServiceError('AI分析服务暂时不可用，请稍后重试', {
    code: 'NETWORK_ERROR',
    payload: error,
  })
}

async function handleResponse(response) {
  const payload = await parseResponse(response)

  if (!response.ok) {
    throw new AiServiceError(payload?.message || 'AI分析服务暂时不可用，请稍后重试', {
      status: response.status,
      code: payload?.code,
      imageQuality: payload?.imageQuality,
      payload,
    })
  }

  if (payload?.isValid === false) {
    throw new AiServiceError(payload.message || '图片不符合分析要求，请重新上传', {
      status: 200,
      code: 'INVALID_IMAGE',
      imageQuality: payload.imageQuality,
      payload,
    })
  }

  return payload
}

async function requestImageAnalysis(path, file, extraFields = {}) {
  if (!file) {
    throw new AiServiceError('请先上传图片', { code: 'IMAGE_REQUIRED' })
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('clientId', getClientId())

  Object.entries(extraFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  try {
    const response = await fetch(path, {
      method: 'POST',
      body: formData,
    })
    return await handleResponse(response)
  } catch (error) {
    if (error instanceof AiServiceError) throw error
    throw createNetworkError(error)
  }
}

async function requestJsonAnalysis(path, data) {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': getClientId(),
      },
      body: JSON.stringify({ ...data, clientId: getClientId() }),
    })
    return await handleResponse(response)
  } catch (error) {
    if (error instanceof AiServiceError) throw error
    throw createNetworkError(error)
  }
}

async function requestJson(path, options = {}) {
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'X-Client-Id': getClientId(),
      },
    })
    return await handleResponse(response)
  } catch (error) {
    if (error instanceof AiServiceError) throw error
    throw createNetworkError(error)
  }
}

export function analyzePalmImage(file, handType, reportStyle = '') {
  return requestImageAnalysis('/api/analyze/palm', file, { handType, reportStyle })
}

export function analyzeFaceImage(file, reportStyle = '') {
  return requestImageAnalysis('/api/analyze/face', file, { reportStyle })
}

export function generateBaziAIReport(formData) {
  return requestJsonAnalysis('/api/analyze/bazi', formData)
}

export function generateTarotAIReport(tarotData) {
  return requestJsonAnalysis('/api/analyze/tarot', tarotData)
}

export function fetchReportById(reportId) {
  return requestJson(`/api/reports/${encodeURIComponent(reportId)}`)
}

export function fetchReports(query = {}) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  })

  const suffix = params.toString() ? `?${params.toString()}` : ''
  return requestJson(`/api/reports${suffix}`)
}

export function fetchUnlockStatus(reportId) {
  return requestJson(`/api/reports/${encodeURIComponent(reportId)}/unlock-status`)
}

export function createAlipayOrder(reportId) {
  return createPersonalQrOrder(reportId)
}

export function createPersonalQrOrder(reportId, payChannel = 'alipay') {
  return requestJson('/api/payment/personal-qr/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportId, payChannel }),
  })
}

export function confirmPersonalQrPayment(orderNo) {
  return requestJson('/api/payment/personal-qr/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderNo }),
  })
}

export function devUnlockReport(reportId) {
  return requestJson('/api/payment/dev/unlock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportId }),
  })
}

export function fetchPaymentOrder(orderNo) {
  return requestJson(`/api/payment/order/${encodeURIComponent(orderNo)}`)
}
