import { getClientId } from './clientId'

const REPORTS_KEY = 'lingxi:reports'
const UNLOCKED_REPORTS_KEY = 'lingxi:unlockedReports'

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
    return value ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getAllStoredReports() {
  const reports = readJson(REPORTS_KEY, [])
  return Array.isArray(reports) ? reports : []
}

export function getReports() {
  const clientId = getClientId()
  return getAllStoredReports().filter((report) => report?.clientId === clientId)
}

export function saveReport(report) {
  const clientId = report?.clientId || getClientId()
  const nextReport = {
    ...report,
    clientId,
  }
  const allReports = getAllStoredReports()
  const otherReports = allReports.filter((item) => item?.clientId && item.clientId !== clientId)
  const currentReports = allReports.filter((item) => item?.clientId === clientId)
  const nextCurrentReports = [nextReport, ...currentReports.filter((item) => item.id !== nextReport.id)].slice(0, 50)
  const nextReports = [...nextCurrentReports, ...otherReports].slice(0, 100)
  writeJson(REPORTS_KEY, nextReports)
  return nextReport.id
}

export function syncReports(reports, clientId = getClientId()) {
  const normalizedReports = Array.isArray(reports)
    ? reports.map((report) => ({ ...report, clientId })).slice(0, 50)
    : []
  const otherReports = getAllStoredReports().filter((item) => item?.clientId && item.clientId !== clientId)
  const nextReports = [...normalizedReports, ...otherReports].slice(0, 100)

  writeJson(REPORTS_KEY, nextReports)
  return normalizedReports
}

export function getReportById(id) {
  return getReports().find((report) => report.id === id) || null
}

export function clearReports() {
  localStorage.removeItem(REPORTS_KEY)
  localStorage.removeItem(UNLOCKED_REPORTS_KEY)
}

export function getUnlockedReports() {
  const unlocked = readJson(UNLOCKED_REPORTS_KEY, [])
  return Array.isArray(unlocked) ? unlocked : []
}

export function unlockReport(reportId) {
  if (!reportId) return []

  const unlocked = new Set(getUnlockedReports())
  unlocked.add(reportId)
  const nextUnlocked = Array.from(unlocked)
  writeJson(UNLOCKED_REPORTS_KEY, nextUnlocked)

  const reports = getReports()
  const nextReports = reports.map((report) => (
    report.id === reportId ? { ...report, unlocked: true } : report
  ))
  writeJson(REPORTS_KEY, nextReports)

  return nextUnlocked
}

export function isReportUnlocked(reportId) {
  return getUnlockedReports().includes(reportId)
}

export const getHistory = getReports
export const clearHistory = clearReports
