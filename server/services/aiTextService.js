import { getBaziPrompt, getDailyFortunePrompt, getTarotPrompt } from '../utils/promptTemplates.js'
import { callOpenAIJson, createAiError } from './aiRuntime.js'

const detailSectionTitles = [
  '未来三个月详细走势',
  '感情专项分析',
  '事业专项分析',
  '财运专项分析',
  '个性化避坑提醒',
  '专属行动建议',
]

function clampScore(score) {
  const value = Number(score)
  if (!Number.isFinite(value)) return 80
  return Math.min(95, Math.max(70, Math.round(value)))
}

function normalizeContent(value, fallback) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean).join('\n')
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }

  return value || fallback
}

function normalizeSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw createAiError('AI分析结果解析失败，请稍后重试', 502, 'AI_RESULT_INVALID')
  }

  const fallbackTitles = ['基础分析', '当前状态', '未来趋势', '行动建议']
  return fallbackTitles.map((title, index) => ({
    title: sections[index]?.title || title,
    content: normalizeContent(sections[index]?.content, 'AI未返回该部分的完整内容，请稍后重新分析。'),
  }))
}

function defaultDetailSections(type) {
  return detailSectionTitles.map((title) => ({
    title,
    content:
      type === '生辰八字'
        ? '本部分用于承载更完整的八字文化体验分析。正式 AI 结果缺少该字段时，系统会保留默认结构，建议稍后重新生成以获得更细致内容。'
        : '本部分用于承载更完整的塔罗牌面趋势分析。正式 AI 结果缺少该字段时，系统会保留默认结构，建议稍后重新生成以获得更细致内容。',
  }))
}

function normalizeDetailSections(detailSections, type) {
  const defaults = defaultDetailSections(type)
  if (!Array.isArray(detailSections) || detailSections.length === 0) return defaults

  return detailSectionTitles.map((title, index) => ({
    title,
    content: normalizeContent(
      detailSections[index]?.content ||
      detailSections.find((section) => section?.title === title)?.content ||
      defaults[index].content,
      defaults[index].content,
    ),
  }))
}

function completeReport(aiResult, type) {
  return {
    type,
    score: clampScore(aiResult?.score),
    summary:
      aiResult?.summary ||
      '这份 AI 报告显示，你近期更适合稳住节奏，把内在感受、现实反馈与可执行的小行动结合起来。',
    sections: normalizeSections(aiResult?.sections),
    detailSections: normalizeDetailSections(aiResult?.detailSections, type),
  }
}

function normalizeTextList(value, fallback) {
  const list = Array.isArray(value) ? value : fallback
  return list.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3)
}

function normalizeDailyText(value, fallback, maxLength = 180) {
  const text = String(value || fallback).trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function completeDailyFortune(aiResult) {
  return {
    type: '今日灵签',
    score: clampScore(aiResult?.score),
    keyword: normalizeDailyText(aiResult?.keyword, '稳住节奏', 12),
    luckyColor: normalizeDailyText(aiResult?.luckyColor, '月白色', 12),
    suitable: normalizeTextList(aiResult?.suitable, ['整理计划', '主动沟通', '完成一件小事']),
    avoid: normalizeTextList(aiResult?.avoid, ['情绪化决定', '冲动消费', '过度解释']),
    quote: normalizeDailyText(aiResult?.quote, '慢下来，不是停下，而是为了看清真正值得走的方向。', 80),
    advice: normalizeDailyText(
      aiResult?.advice,
      '今日适合处理已经积压但并不复杂的事情，把注意力从远处的大问题收回来，先完成一件具体的小事，会让你重新获得掌控感。',
      180,
    ),
  }
}

async function callTextModel({ moduleType, prompt }) {
  return callOpenAIJson({
    moduleType,
    kind: 'text',
    temperature: 0.42,
    messages: [
      {
        role: 'system',
        content:
          '你是一个严格输出 JSON 的文本报告生成助手，内容仅用于娱乐、文化体验与自我探索参考。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  })
}

export async function generateBaziReport(data) {
  const aiResult = await callTextModel({
    moduleType: 'bazi',
    prompt: getBaziPrompt(data),
  })

  return completeReport(aiResult, '生辰八字')
}

export async function generateTarotReport(data) {
  const aiResult = await callTextModel({
    moduleType: 'tarot',
    prompt: getTarotPrompt(data),
  })

  return completeReport(aiResult, '塔罗牌')
}

export async function generateDailyFortune() {
  const aiResult = await callTextModel({
    moduleType: 'daily',
    prompt: getDailyFortunePrompt(),
  })

  return completeDailyFortune(aiResult)
}
