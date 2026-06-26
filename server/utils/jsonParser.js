export function parseAIJson(text) {
  try {
    const raw = String(text || '').trim()
    const withoutJsonFence = raw.replace(/```json/gi, '').replace(/```/g, '').trim()

    const firstBrace = withoutJsonFence.indexOf('{')
    const lastBrace = withoutJsonFence.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('JSON braces not found')
    }

    const jsonText = withoutJsonFence.slice(firstBrace, lastBrace + 1)
    return JSON.parse(jsonText)
  } catch {
    const error = new Error('AI分析结果解析失败，请稍后重试')
    error.statusCode = 502
    error.code = 'AI_JSON_PARSE_ERROR'
    error.expose = true
    throw error
  }
}
