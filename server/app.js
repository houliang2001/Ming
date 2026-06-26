import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import adminRouter from './routes/admin.js'
import analyzeRouter from './routes/analyze.js'
import paymentRouter from './routes/payment.js'
import reportsRouter from './routes/reports.js'
import { AI_UNAVAILABLE_MESSAGE, getAiHealthStatus } from './services/aiRuntime.js'

const app = express()
const port = Number(process.env.PORT || 3001)

const defaultAllowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://hl.muytang.cn',
  'https://hl.muytang.cn',
  'http://lingxige.xyz',
  'https://lingxige.xyz',
  'http://www.lingxige.xyz',
  'https://www.lingxige.xyz',
]

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
])

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      console.error('[CORS_BLOCKED]', {
        origin,
        allowedOrigins: Array.from(allowedOrigins),
      })
      callback(new Error('当前来源未被允许访问 AI 分析服务'))
    },
  }),
)

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lingxi-ai-vision', time: new Date().toISOString() })
})

app.get('/api/health/ai', (_req, res) => {
  res.json(getAiHealthStatus())
})

app.use('/api/analyze', analyzeRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/admin', adminRouter)

app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500
  const message = err.expose || status < 500 ? err.message : AI_UNAVAILABLE_MESSAGE

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({
    success: false,
    error: true,
    message,
    code: err.code || 'SERVER_ERROR',
  })
})

app.listen(port, () => {
  console.log(`Lingxi AI vision server listening on http://127.0.0.1:${port}`)
})
