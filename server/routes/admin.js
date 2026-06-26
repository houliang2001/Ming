import express from 'express'
import prisma from '../lib/prisma.js'

const router = express.Router()

function createError(statusCode, message, code) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  error.expose = true
  return error
}

function parsePagination(query) {
  const page = Math.max(Number(query.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100)

  return { page, pageSize }
}

function parseBoolean(value) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function parseDateRange(query, field = 'createdAt') {
  const range = {}

  if (query.startDate) {
    range.gte = new Date(`${query.startDate}T00:00:00`)
  }

  if (query.endDate) {
    range.lte = new Date(`${query.endDate}T23:59:59.999`)
  }

  return Object.keys(range).length ? { [field]: range } : {}
}

function startOfDay(date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function addDays(date, days) {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sumOrders(orders) {
  return Number(orders.reduce((sum, order) => sum + Number(order.amount), 0).toFixed(2))
}

function assertAdminToken(req, _res, next) {
  const expectedToken = process.env.ADMIN_TOKEN
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!expectedToken || token !== expectedToken) {
    next(createError(401, '后台口令无效或未配置', 'ADMIN_UNAUTHORIZED'))
    return
  }

  next()
}

router.use(assertAdminToken)

router.get('/stats', async (_req, res, next) => {
  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const tomorrowStart = addDays(todayStart, 1)
    const yesterdayStart = addDays(todayStart, -1)
    const monthStart = startOfMonth(now)

    const [
      totalReports,
      totalUnlocked,
      totalOrders,
      paidOrders,
      pendingOrders,
      paidOrderRows,
      todayPaidRows,
      yesterdayPaidRows,
      monthPaidRows,
      reportsByTypeRows,
      dailyFortuneTotal,
      dailyFortuneToday,
      dailyFortuneRows,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { unlocked: true } }),
      prisma.paymentOrder.count(),
      prisma.paymentOrder.count({ where: { payStatus: 'paid' } }),
      prisma.paymentOrder.count({ where: { payStatus: 'pending' } }),
      prisma.paymentOrder.findMany({
        where: { payStatus: 'paid' },
        select: { amount: true },
      }),
      prisma.paymentOrder.findMany({
        where: {
          payStatus: 'paid',
          paidAt: { gte: todayStart, lt: tomorrowStart },
        },
        select: { amount: true },
      }),
      prisma.paymentOrder.findMany({
        where: {
          payStatus: 'paid',
          paidAt: { gte: yesterdayStart, lt: todayStart },
        },
        select: { amount: true },
      }),
      prisma.paymentOrder.findMany({
        where: {
          payStatus: 'paid',
          paidAt: { gte: monthStart, lt: tomorrowStart },
        },
        select: { amount: true },
      }),
      prisma.report.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      prisma.dailyFortune.count(),
      prisma.dailyFortune.count({
        where: { createdAt: { gte: todayStart, lt: tomorrowStart } },
      }),
      prisma.dailyFortune.findMany({
        where: {
          createdAt: { gte: addDays(todayStart, -6), lt: tomorrowStart },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const reportsByType = reportsByTypeRows.reduce((result, item) => {
      result[item.type] = item._count.type
      return result
    }, {})
    const dailyFortuneTrendMap = new Map()

    for (let index = 0; index < 7; index += 1) {
      const date = addDays(todayStart, index - 6)
      dailyFortuneTrendMap.set(formatDateKey(date), { date: formatDateKey(date), count: 0 })
    }

    dailyFortuneRows.forEach((item) => {
      const date = formatDateKey(item.createdAt)
      const current = dailyFortuneTrendMap.get(date)

      if (current) {
        current.count += 1
      }
    })

    res.json({
      totalReports,
      totalUnlocked,
      totalLocked: totalReports - totalUnlocked,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue: sumOrders(paidOrderRows),
      todayRevenue: sumOrders(todayPaidRows),
      yesterdayRevenue: sumOrders(yesterdayPaidRows),
      todayPaidOrders: todayPaidRows.length,
      monthRevenue: sumOrders(monthPaidRows),
      monthPaidOrders: monthPaidRows.length,
      reportsByType,
      dailyFortuneTotal,
      dailyFortuneToday,
      dailyFortuneTrend7d: Array.from(dailyFortuneTrendMap.values()),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/reports', async (req, res, next) => {
  try {
    const { page, pageSize } = parsePagination(req.query)
    const where = {
      ...parseDateRange(req.query),
    }
    const unlocked = parseBoolean(req.query.unlocked)
    const keyword = String(req.query.keyword || '').trim()

    if (req.query.type) {
      where.type = String(req.query.type)
    }

    if (unlocked !== undefined) {
      where.unlocked = unlocked
    }

    if (keyword) {
      where.OR = [
        { id: { contains: keyword } },
        { summary: { contains: keyword } },
      ]
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

    res.json({ list, total, page, pageSize })
  } catch (error) {
    next(error)
  }
})

router.get('/reports/:id', async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
    })

    if (!report) {
      throw createError(404, '报告不存在', 'REPORT_NOT_FOUND')
    }

    res.json(report)
  } catch (error) {
    next(error)
  }
})

router.get('/orders', async (req, res, next) => {
  try {
    const { page, pageSize } = parsePagination(req.query)
    const where = {
      ...parseDateRange(req.query),
    }
    const keyword = String(req.query.keyword || '').trim()

    if (req.query.payStatus) {
      where.payStatus = String(req.query.payStatus)
    }

    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword } },
        { reportId: { contains: keyword } },
        { alipayTradeNo: { contains: keyword } },
      ]
    }

    const [list, total] = await Promise.all([
      prisma.paymentOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.paymentOrder.count({ where }),
    ])

    res.json({
      list: list.map((order) => ({
        ...order,
        amount: Number(order.amount),
      })),
      total,
      page,
      pageSize,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/revenue/daily', async (_req, res, next) => {
  try {
    const todayStart = startOfDay(new Date())
    const firstDay = addDays(todayStart, -6)
    const tomorrowStart = addDays(todayStart, 1)
    const paidOrders = await prisma.paymentOrder.findMany({
      where: {
        payStatus: 'paid',
        paidAt: { gte: firstDay, lt: tomorrowStart },
      },
      select: {
        amount: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    })
    const dailyMap = new Map()

    for (let index = 0; index < 7; index += 1) {
      const date = addDays(firstDay, index)
      dailyMap.set(formatDateKey(date), { date: formatDateKey(date), revenue: 0, paidOrders: 0 })
    }

    paidOrders.forEach((order) => {
      const date = formatDateKey(order.paidAt)
      const current = dailyMap.get(date)

      if (!current) return

      current.revenue = Number((current.revenue + Number(order.amount)).toFixed(2))
      current.paidOrders += 1
    })

    res.json({ list: Array.from(dailyMap.values()) })
  } catch (error) {
    next(error)
  }
})

export default router
