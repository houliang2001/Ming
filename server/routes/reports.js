import express from 'express'
import {
  getReportById,
  getReports,
  isReportUnlocked,
} from '../services/reportService.js'

const router = express.Router()

function createNotFound(message = '报告不存在') {
  const error = new Error(message)
  error.statusCode = 404
  error.code = 'REPORT_NOT_FOUND'
  error.expose = true
  return error
}

function getRequestClientId(req) {
  return String(req.headers['x-client-id'] || req.query.clientId || '').trim()
}

router.get('/', async (req, res, next) => {
  try {
    const clientId = getRequestClientId(req)
    const result = await getReports({
      ...req.query,
      clientId,
    })
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const report = await getReportById(req.params.id)

    if (!report) {
      throw createNotFound()
    }

    res.json(report)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/unlock-status', async (req, res, next) => {
  try {
    const report = await getReportById(req.params.id)

    if (!report) {
      throw createNotFound()
    }

    const unlocked = await isReportUnlocked(req.params.id)
    res.json({ reportId: req.params.id, unlocked })
  } catch (error) {
    next(error)
  }
})

export default router
