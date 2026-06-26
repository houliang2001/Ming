import { getFacePrompt, getPalmPrompt } from '../utils/promptTemplates.js'
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

function normalizeQuality(value) {
  if (value === 'blurry' || value === 'invalid') return value
  return 'clear'
}

function normalizeSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw createAiError('AI分析结果解析失败，请稍后重试', 502, 'AI_RESULT_INVALID')
  }

  return sections.map((section, index) => ({
    title: section?.title || `分析 ${index + 1}`,
    content: section?.content || 'AI未返回该部分的完整内容，请稍后重新分析。',
  }))
}

function createDefaultDetailSections(type) {
  return detailSectionTitles.map((title) => ({
    title,
    content:
      type === '手相测算'
        ? '本部分用于承载更完整的手相趋势拆解。正式 AI 结果缺少该字段时，系统会保留默认结构，建议重新分析以获得更细致内容。'
        : '本部分用于承载更完整的面相趋势拆解。正式 AI 结果缺少该字段时，系统会保留默认结构，建议重新分析以获得更细致内容。',
  }))
}

function normalizeDetailSections(detailSections, type) {
  if (!Array.isArray(detailSections) || detailSections.length === 0) {
    return createDefaultDetailSections(type)
  }

  const defaults = createDefaultDetailSections(type)
  return detailSectionTitles.map((title, index) => ({
    title,
    content:
      detailSections[index]?.content ||
      detailSections.find((section) => section?.title === title)?.content ||
      defaults[index].content,
  }))
}

function completeReport(aiResult, type, invalidMessage) {
  const imageQuality = normalizeQuality(aiResult?.imageQuality)
  const isValid = aiResult?.isValid !== false && imageQuality !== 'invalid'

  if (!isValid) {
    throw createAiError(aiResult?.message || invalidMessage, 400, 'INVALID_IMAGE')
  }

  return {
    type,
    score: clampScore(aiResult?.score),
    summary:
      aiResult?.summary ||
      '这份 AI 视觉报告显示，你近期更适合稳住节奏，把观察到的线索转化为温和、清晰、可执行的行动。',
    imageQuality,
    sections: normalizeSections(aiResult?.sections),
    detailSections: normalizeDetailSections(aiResult?.detailSections, type),
  }
}

async function callVisionModel({ moduleType, imageBuffer, mimeType, prompt }) {
  const imageBase64 = imageBuffer.toString('base64')

  return callOpenAIJson({
    moduleType,
    kind: 'vision',
    temperature: 0.35,
    messages: [
      {
        role: 'system',
        content:
          '你是一个严格输出 JSON 的多模态视觉分析助手，内容仅用于娱乐、文化体验与自我探索参考。',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  })
}

export async function analyzePalmImage(imageFile, options = {}) {
  const handType = options.handType || options.hand || '右手'
  const aiResult = await callVisionModel({
    moduleType: 'palm',
    imageBuffer: imageFile.buffer,
    mimeType: imageFile.mimetype,
    prompt: getPalmPrompt({ handType }),
  })

  return completeReport(aiResult, '手相测算', '请上传清晰、无遮挡、完整展开的手掌照片。')
}

export async function analyzeFaceImage(imageFile, options = {}) {
  const aiResult = await callVisionModel({
    moduleType: 'face',
    imageBuffer: imageFile.buffer,
    mimeType: imageFile.mimetype,
    prompt: getFacePrompt(options),
  })

  return completeReport(aiResult, '面相测算', '请上传清晰的正脸照片，避免侧脸、遮挡、过暗环境或过度美颜。')
}
