import prisma from '../lib/prisma.js'

function normalizeList(value) {
  return Array.isArray(value) ? value : []
}

export function toDailyFortuneDto(dailyFortune) {
  if (!dailyFortune) return null

  return {
    id: dailyFortune.id,
    type: '今日灵签',
    clientId: dailyFortune.clientId || undefined,
    score: dailyFortune.score,
    keyword: dailyFortune.keyword,
    luckyColor: dailyFortune.luckyColor || '',
    suitable: normalizeList(dailyFortune.suitable),
    avoid: normalizeList(dailyFortune.avoid),
    quote: dailyFortune.quote,
    advice: dailyFortune.advice,
    fortuneDate: dailyFortune.fortuneDate,
    createdAt: dailyFortune.createdAt instanceof Date ? dailyFortune.createdAt.toISOString() : dailyFortune.createdAt,
  }
}

export async function createDailyFortune(data) {
  const dailyFortune = await prisma.dailyFortune.create({
    data: {
      clientId: data.clientId || null,
      score: Number(data.score || 80),
      keyword: data.keyword || '稳住节奏',
      luckyColor: data.luckyColor || null,
      suitable: normalizeList(data.suitable),
      avoid: normalizeList(data.avoid),
      quote: data.quote || '慢下来，不是停下，而是为了看清真正值得走的方向。',
      advice: data.advice || '今日适合处理一件具体的小事，把注意力收回到当下可执行的行动里。',
      fortuneDate: data.fortuneDate,
    },
  })

  return toDailyFortuneDto(dailyFortune)
}
