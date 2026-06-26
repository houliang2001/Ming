import { getClientId } from './clientId'

function getTodayKey() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

function getCacheKey() {
  return `lingxige_daily_fortune_${getTodayKey()}`
}

async function parseResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    const isHtmlError = /<html[\s>]|<!doctype html|Cannot\s+(GET|POST)/i.test(text)
    return {
      message: isHtmlError ? '今日灵签接口未部署或后端未重启，请检查服务器后端服务' : text,
      raw: text,
    }
  }
}

export function getTodayDailyFortuneFromCache() {
  try {
    const data = JSON.parse(localStorage.getItem(getCacheKey()) || 'null')
    return data?.clientId === getClientId() ? data : null
  } catch {
    return null
  }
}

export function saveTodayDailyFortuneToCache(data) {
  const fortune = {
    ...data,
    clientId: data?.clientId || getClientId(),
  }

  localStorage.setItem(getCacheKey(), JSON.stringify(fortune))
  return fortune
}

export async function generateDailyFortune() {
  const clientId = getClientId()
  const response = await fetch('/api/analyze/daily', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': clientId,
    },
    body: JSON.stringify({ clientId }),
  })
  const payload = await parseResponse(response)

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || '今日灵签生成失败，请稍后重试')
  }

  const data = payload?.data || payload
  return saveTodayDailyFortuneToCache(data)
}
