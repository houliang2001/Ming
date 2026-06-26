import https from 'node:https'
import { parseAIJson } from '../utils/jsonParser.js'
import { recordAiLog } from './aiLogService.js'

export const AI_CONFIG_MISSING_MESSAGE = 'AI接口未配置，请检查服务器环境变量'
export const AI_UNAVAILABLE_MESSAGE = 'AI分析服务暂时不可用，请稍后重试'
export const AI_PARSE_MESSAGE = 'AI分析结果解析失败，请稍后重试'

function isPlaceholder(value = '') {
  const text = String(value || '').trim()

  return (
    !text ||
    text.startsWith('your_') ||
    text.startsWith('optional_') ||
    text.includes('你的') ||
    text.includes('阿里云百炼') ||
    text.includes('模型名称') ||
    text.endsWith('_here')
  )
}

function getTimeoutMs() {
  const timeout = Number(process.env.AI_TIMEOUT_MS || 60000)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 60000
}

function isMockEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_AI_MOCK === 'true'
}

function getAiModel() {
  return process.env.AI_MODEL || ''
}

export function createAiError(message, statusCode = 502, code = 'AI_SERVICE_ERROR') {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  error.expose = true
  return error
}

export function getAiHealthStatus() {
  const baseUrlConfigured = !isPlaceholder(process.env.AI_BASE_URL)
  const apiKeyConfigured = !isPlaceholder(process.env.AI_API_KEY)
  const modelConfigured = !isPlaceholder(getAiModel())

  return {
    success: true,
    baseUrlConfigured,
    apiKeyConfigured,
    modelConfigured,
    aiReady: baseUrlConfigured && apiKeyConfigured && modelConfigured,
    timeoutMs: getTimeoutMs(),
    mockEnabled: isMockEnabled(),
    mockAllowed: process.env.NODE_ENV !== 'production',
  }
}

function getAiConfig(kind) {
  const baseUrl = String(process.env.AI_BASE_URL || '').replace(/\/$/, '')
  const apiKey = String(process.env.AI_API_KEY || '')
  const model = getAiModel()

  if (isPlaceholder(baseUrl) || isPlaceholder(apiKey) || isPlaceholder(model)) {
    throw createAiError(AI_CONFIG_MISSING_MESSAGE, 503, 'AI_CONFIG_MISSING')
  }

  return {
    apiKey,
    endpoint: `${baseUrl}/chat/completions`,
    model,
    timeoutMs: getTimeoutMs(),
  }
}

function normalizeAiError(error) {
  if (error?.code === 'AI_CONFIG_MISSING') return error

  if (error?.name === 'AbortError') {
    return createAiError(AI_UNAVAILABLE_MESSAGE, 504, 'AI_TIMEOUT')
  }

  if (error?.code === 'AI_JSON_PARSE_ERROR' || error?.code === 'AI_EMPTY_RESPONSE') {
    return createAiError(AI_PARSE_MESSAGE, 502, error.code)
  }

  if (error?.expose && error?.code) return error

  return createAiError(AI_UNAVAILABLE_MESSAGE, 502, 'AI_SERVICE_ERROR')
}

function logAiCallFailure(moduleType, error) {
  console.error('[AI_CALL_FAILED]', {
    moduleType,
    name: error?.name,
    message: error?.message,
    code: error?.code,
    statusCode: error?.statusCode,
    upstreamStatus: error?.upstreamStatus,
    upstreamStatusText: error?.upstreamStatusText,
    upstreamBody: error?.upstreamBody,
    cause: error?.cause?.message || error?.cause,
  })
}

function createResponseLike(status, statusText, bodyText) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () => bodyText,
    json: async () => JSON.parse(bodyText),
  }
}

function requestJsonWithHttps(endpoint, { headers, body, signal, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint)
    const request = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: timeoutMs,
      },
      (response) => {
        const chunks = []

        response.on('data', (chunk) => {
          chunks.push(chunk)
        })

        response.on('end', () => {
          resolve(
            createResponseLike(
              response.statusCode || 0,
              response.statusMessage || '',
              Buffer.concat(chunks).toString('utf8'),
            ),
          )
        })
      },
    )

    request.on('timeout', () => {
      request.destroy(Object.assign(new Error('AI request timeout'), { name: 'AbortError' }))
    })

    request.on('error', reject)

    if (signal) {
      if (signal.aborted) {
        request.destroy(Object.assign(new Error('AI request aborted'), { name: 'AbortError' }))
        return
      }

      signal.addEventListener(
        'abort',
        () => {
          request.destroy(Object.assign(new Error('AI request aborted'), { name: 'AbortError' }))
        },
        { once: true },
      )
    }

    request.write(body)
    request.end()
  })
}

function requestJson(endpoint, options) {
  if (typeof fetch === 'function') {
    return fetch(endpoint, options)
  }

  return requestJsonWithHttps(endpoint, {
    headers: options.headers,
    body: options.body,
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  })
}

export async function callOpenAIJson({ moduleType, kind, messages, temperature = 0.4 }) {
  try {
    const config = getAiConfig(kind)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), config.timeoutMs)

    let response
    try {
      response = await requestJson(config.endpoint, {
        method: 'POST',
        signal: controller.signal,
        timeoutMs: config.timeoutMs,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          temperature,
          max_tokens: 1800,
          enable_thinking: false,
          response_format: { type: 'json_object' },
          messages,
        }),
      })
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      const upstreamBody = await response.text().catch(() => '')
      const error = createAiError(AI_UNAVAILABLE_MESSAGE, 502, 'AI_UPSTREAM_ERROR')
      error.upstreamStatus = response.status
      error.upstreamStatusText = response.statusText
      error.upstreamBody = upstreamBody.slice(0, 1200)
      throw error
    }

    const payload = await response.json().catch(() => null)
    const content = payload?.choices?.[0]?.message?.content

    if (!content) {
      throw createAiError(AI_PARSE_MESSAGE, 502, 'AI_EMPTY_RESPONSE')
    }

    const result = parseAIJson(content)
    await recordAiLog(moduleType, true)
    return result
  } catch (error) {
    logAiCallFailure(moduleType, error)
    const aiError = normalizeAiError(error)
    await recordAiLog(moduleType, false, `${aiError.code}: ${aiError.message}`)
    throw aiError
  }
}
