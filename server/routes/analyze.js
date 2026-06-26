import path from 'node:path'
import express from 'express'
import multer from 'multer'
import {
  analyzeFaceImage as runFaceAnalysis,
  analyzePalmImage as runPalmAnalysis,
} from '../services/aiVisionService.js'
import {
  generateDailyFortune,
  generateBaziReport,
  generateTarotReport,
} from '../services/aiTextService.js'
import { createDailyFortune } from '../services/dailyFortuneService.js'
import { createReport } from '../services/reportService.js'

const router = express.Router()

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    const ext = path.extname(file.originalname || '').toLowerCase()

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
      const error = new Error('请上传 jpg、jpeg、png 或 webp 格式图片')
      error.statusCode = 400
      error.code = 'INVALID_FILE_TYPE'
      callback(error)
      return
    }

    callback(null, true)
  },
})

function createBadRequest(message, code = 'BAD_REQUEST') {
  const error = new Error(message)
  error.statusCode = 400
  error.code = code
  error.expose = true
  return error
}

function sendUploadError(res, statusCode, code, message) {
  res.status(statusCode).json({
    success: false,
    message,
    code,
  })
}

function getClientId(req) {
  return String(req.body?.clientId || req.headers['x-client-id'] || '').trim()
}

function getFortuneDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        sendUploadError(res, 400, 'FILE_TOO_LARGE', '图片大小不能超过 5MB')
        return
      }

      sendUploadError(res, err.statusCode || 400, err.code || 'UPLOAD_ERROR', err.message || '图片上传失败')
      return
    }

    if (!req.file) {
      sendUploadError(res, 400, 'IMAGE_REQUIRED', '请上传图片字段 image')
      return
    }

    next()
  })
}

router.post('/palm', uploadImage, async (req, res, next) => {
  try {
    const handType = req.body.handType || req.body.hand || ''
    const clientId = getClientId(req)
    const report = await runPalmAnalysis(req.file, { handType })
    const savedReport = await createReport({
      ...report,
      clientId,
      inputData: {
        handType,
      },
    })

    res.json(savedReport)
  } catch (error) {
    next(error)
  }
})

router.post('/face', uploadImage, async (req, res, next) => {
  try {
    const clientId = getClientId(req)
    const report = await runFaceAnalysis(req.file)
    const savedReport = await createReport({
      ...report,
      clientId,
      inputData: {
        source: 'face-upload',
      },
    })

    res.json(savedReport)
  } catch (error) {
    next(error)
  }
})

router.post('/bazi', async (req, res, next) => {
  try {
    const data = req.body || {}
    const clientId = getClientId(req)

    if (!data.birthDate) {
      throw createBadRequest('请选择出生日期', 'BIRTH_DATE_REQUIRED')
    }

    if (!data.birthTime) {
      throw createBadRequest('请选择出生时间', 'BIRTH_TIME_REQUIRED')
    }

    const inputData = {
      name: data.name || '',
      gender: data.gender || '',
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthPlace: data.birthPlace || '',
      questionType: data.questionType || '综合',
    }

    const report = await generateBaziReport(inputData)
    const savedReport = await createReport({
      ...report,
      clientId,
      inputData,
    })

    res.json(savedReport)
  } catch (error) {
    next(error)
  }
})

router.post('/tarot', async (req, res, next) => {
  try {
    const data = req.body || {}
    const clientId = getClientId(req)

    const inputData = {
      question: data.question || '近期综合运势',
      spreadType: data.spreadType || '三张牌',
      cards: Array.isArray(data.cards) ? data.cards : [],
    }

    const report = await generateTarotReport(inputData)
    const savedReport = await createReport({
      ...report,
      clientId,
      inputData,
    })

    res.json(savedReport)
  } catch (error) {
    next(error)
  }
})

router.post('/daily', async (req, res, next) => {
  try {
    const clientId = getClientId(req)
    const fortune = await generateDailyFortune()
    const savedFortune = await createDailyFortune({
      ...fortune,
      clientId,
      fortuneDate: getFortuneDate(),
    })

    res.json({
      success: true,
      data: savedFortune,
      message: 'ok',
    })
  } catch (error) {
    if (error?.code === 'AI_CONFIG_MISSING') {
      next(error)
      return
    }

    error.message = '今日灵签生成失败，请稍后重试'
    error.code = 'DAILY_GENERATE_FAILED'
    error.statusCode = error.statusCode || 502
    error.expose = true
    next(error)
  }
})

export default router
