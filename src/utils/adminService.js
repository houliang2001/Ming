const ADMIN_TOKEN_KEY = 'lingxi:adminToken'

export class AdminServiceError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'AdminServiceError'
    this.status = options.status || 0
    this.code = options.code || 'ADMIN_SERVICE_ERROR'
    this.payload = options.payload || null
  }
}

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || ''
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

async function requestAdmin(path, options = {}) {
  const token = getAdminToken()

  if (!token) {
    throw new AdminServiceError('请先输入管理员口令', { status: 401, code: 'ADMIN_TOKEN_REQUIRED' })
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })
  const payload = await parseResponse(response)

  if (!response.ok) {
    throw new AdminServiceError(payload?.message || '后台数据读取失败', {
      status: response.status,
      code: payload?.code,
      payload,
    })
  }

  return payload
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function loginAdmin(token) {
  const normalizedToken = String(token || '').trim()

  if (!normalizedToken) {
    throw new AdminServiceError('请输入管理员口令', { status: 401, code: 'ADMIN_TOKEN_REQUIRED' })
  }

  sessionStorage.setItem(ADMIN_TOKEN_KEY, normalizedToken)
  return normalizedToken
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function hasAdminToken() {
  return Boolean(getAdminToken())
}

export function getAdminStats() {
  return requestAdmin('/api/admin/stats')
}

export function getAdminReports(params) {
  return requestAdmin(`/api/admin/reports${buildQuery(params)}`)
}

export function getAdminReportDetail(id) {
  return requestAdmin(`/api/admin/reports/${encodeURIComponent(id)}`)
}

export function getAdminOrders(params) {
  return requestAdmin(`/api/admin/orders${buildQuery(params)}`)
}

export function getDailyRevenue() {
  return requestAdmin('/api/admin/revenue/daily')
}
