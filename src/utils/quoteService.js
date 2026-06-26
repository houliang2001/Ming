const DAILY_QUOTE_KEY = 'lingxige_daily_quote'

export const QUOTES = [
  '命运不是固定答案，而是一种提醒。真正改变未来的，始终是你当下的选择。',
  '有些答案不会立刻出现，但每一次选择，都会把你带向更清晰的方向。',
  '运势不是让你等待结果，而是提醒你在合适的时候主动调整。',
  '当你开始看见自己，未来就已经悄悄发生变化。',
  '所谓好运，常常来自一次清醒的判断和一次坚定的行动。',
  '不必急着确认所有答案，先把今天能做好的事情做好。',
  '人生不是被某个结果定义，而是在一次次选择中慢慢展开。',
  '你真正需要的不是预知未来，而是看清此刻的自己。',
  '有些转机，不是突然降临，而是你准备好之后自然出现。',
  '迷茫并不代表停滞，它只是提醒你该重新整理方向。',
  '越是重要的选择，越需要慢下来听见内心真正的声音。',
  '今天的你，不需要立刻完美，只需要比昨天更清醒一点。',
  '风会改变方向，人也可以重新选择自己的路。',
  '好运不是等待来的，而是在一次次认真生活里靠近的。',
  '所有答案都不会替你决定人生，它们只是帮你多看见一种可能。',
  '当你愿意面对问题，问题就已经开始松动。',
  '未来不是被写好的剧本，而是你正在参与创作的章节。',
  '真正的指引，不是告诉你该去哪，而是帮你看清为什么出发。',
  '不要害怕阶段性的停顿，那可能是下一次转身前的蓄力。',
  '你正在经历的每一步，都会成为未来某个答案的一部分。',
]

function getTodayDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getSeededQuote(dateText) {
  const seed = Number(dateText.replaceAll('-', ''))

  if (!Number.isFinite(seed) || QUOTES.length === 0) {
    return QUOTES[0] || ''
  }

  return QUOTES[seed % QUOTES.length]
}

export function getRandomQuote(excludeQuote = '') {
  if (QUOTES.length === 0) {
    return ''
  }

  if (QUOTES.length === 1) {
    return QUOTES[0]
  }

  const nextQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  if (nextQuote !== excludeQuote) {
    return nextQuote
  }

  const currentIndex = QUOTES.indexOf(nextQuote)
  return QUOTES[(currentIndex + 1) % QUOTES.length]
}

export function getDailyQuote() {
  const today = getTodayDate()

  try {
    const cachedQuote = JSON.parse(window.localStorage.getItem(DAILY_QUOTE_KEY) || 'null')

    if (cachedQuote?.date === today && cachedQuote?.quote) {
      return cachedQuote.quote
    }
  } catch {
    // Ignore storage errors and fall back to deterministic daily selection.
  }

  const quote = getSeededQuote(today)

  try {
    window.localStorage.setItem(DAILY_QUOTE_KEY, JSON.stringify({ date: today, quote }))
  } catch {
    // Browsers can disable localStorage; the deterministic quote still works.
  }

  return quote
}
