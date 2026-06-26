import prisma from '../lib/prisma.js'

function normalizeSections(value) {
  return Array.isArray(value) ? value : []
}

export function toReportDto(report) {
  if (!report) return null

  return {
    id: report.id,
    clientId: report.clientId || undefined,
    type: report.type,
    score: report.score,
    summary: report.summary,
    sections: normalizeSections(report.sections),
    detailSections: normalizeSections(report.detailSections),
    imageQuality: report.imageQuality || undefined,
    inputData: report.inputData || undefined,
    unlocked: Boolean(report.unlocked),
    createdAt: report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
    updatedAt: report.updatedAt instanceof Date ? report.updatedAt.toISOString() : report.updatedAt,
  }
}

export async function createReport(reportData) {
  const report = await prisma.report.create({
    data: {
      type: reportData.type,
      clientId: reportData.clientId || null,
      score: Number(reportData.score || 0),
      summary: reportData.summary || '',
      sections: normalizeSections(reportData.sections),
      detailSections: normalizeSections(reportData.detailSections),
      imageQuality: reportData.imageQuality || null,
      inputData: reportData.inputData || null,
      unlocked: Boolean(reportData.unlocked),
    },
  })

  return toReportDto(report)
}

export async function getReportById(reportId) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  })

  return toReportDto(report)
}

export async function getReports(query = {}) {
  const page = Math.max(Number(query.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100)
  const clientId = String(query.clientId || '').trim()
  const where = {}

  if (!clientId) {
    return {
      list: [],
      total: 0,
      page,
      pageSize,
    }
  }

  where.clientId = clientId

  if (query.type) {
    where.type = String(query.type)
  }

  if (query.unlocked === 'true' || query.unlocked === true) {
    where.unlocked = true
  }

  if (query.unlocked === 'false' || query.unlocked === false) {
    where.unlocked = false
  }

  const [list, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ])

  return {
    list: list.map(toReportDto),
    total,
    page,
    pageSize,
  }
}

export async function markReportUnlocked(reportId) {
  const report = await prisma.report.update({
    where: { id: reportId },
    data: { unlocked: true },
  })

  return toReportDto(report)
}

export async function isReportUnlocked(reportId) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { unlocked: true },
  })

  return Boolean(report?.unlocked)
}
