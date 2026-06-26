import express from 'express'
import { REPORT_UNLOCK_AMOUNT, isExpectedPaymentAmount } from '../config/payment.js'
import {
  confirmPersonalQrPayment,
  createDevPaidOrder,
  createPaymentOrder,
  getOrderByOrderNo,
  markOrderPaid,
} from '../services/orderService.js'
import { getReportById } from '../services/reportService.js'

const router = express.Router()

function createError(statusCode, message, code) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  error.expose = true
  return error
}

async function requireReport(reportId) {
  if (!reportId) {
    throw createError(400, '缺少报告 ID', 'REPORT_ID_REQUIRED')
  }

  const report = await getReportById(reportId)

  if (!report) {
    throw createError(404, '报告不存在', 'REPORT_NOT_FOUND')
  }

  return report
}

async function createPersonalQrOrder(req, res, next) {
  try {
    const { reportId, payChannel: rawPayChannel } = req.body || {}
    const payChannel = rawPayChannel === 'wechat' ? 'wechat' : 'alipay'
    const qrImageUrl = payChannel === 'wechat' ? '/wechat-payment-qr.jpg' : '/payment-qr.jpg'
    const report = await requireReport(reportId)

    if (report.unlocked) {
      res.json({
        reportId,
        unlocked: true,
        amount: REPORT_UNLOCK_AMOUNT,
        message: '当前报告已解锁',
      })
      return
    }

    const order = await createPaymentOrder({ reportId, payChannel })

    res.json({
      orderNo: order.orderNo,
      reportId,
      amount: REPORT_UNLOCK_AMOUNT,
      payStatus: order.payStatus,
      payChannel: order.payChannel,
      qrImageUrl,
      unlocked: false,
      message: `请使用${payChannel === 'wechat' ? '微信' : '支付宝'}扫码支付 6.66 元，倒计时结束后自动解锁。`,
    })
  } catch (error) {
    next(error)
  }
}

router.post('/personal-qr/create', createPersonalQrOrder)

router.post('/personal-qr/confirm', async (req, res, next) => {
  try {
    const { orderNo } = req.body || {}

    if (!orderNo) {
      throw createError(400, '缺少订单号', 'ORDER_NO_REQUIRED')
    }

    const order = await getOrderByOrderNo(orderNo)

    if (!order) {
      throw createError(404, '订单不存在', 'ORDER_NOT_FOUND')
    }

    if (order.payStatus === 'paid') {
      res.json({ order, unlocked: true })
      return
    }

    const result = await confirmPersonalQrPayment(orderNo)

    res.json({
      order: result.order,
      report: result.report,
      unlocked: true,
    })
  } catch (error) {
    next(error)
  }
})

// Keep the old endpoint as a compatibility alias for existing frontend/admin code.
router.post('/alipay/create', createPersonalQrOrder)

router.post('/alipay/notify', async (req, res, next) => {
  try {
    const body = req.body || {}
    const orderNo = body.out_trade_no || body.orderNo
    const tradeStatus = body.trade_status
    const amount = body.total_amount

    if (!orderNo) {
      throw createError(400, '缺少支付宝订单号', 'ORDER_NO_REQUIRED')
    }

    const order = await getOrderByOrderNo(orderNo)

    if (!order) {
      throw createError(404, '订单不存在', 'ORDER_NOT_FOUND')
    }

    if ((tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') && isExpectedPaymentAmount(amount)) {
      await markOrderPaid({
        orderNo,
        alipayTradeNo: body.trade_no || null,
        rawNotify: body,
      })
      res.send('success')
      return
    }

    res.send('failure')
  } catch (error) {
    next(error)
  }
})

router.get('/order/:orderNo', async (req, res, next) => {
  try {
    const order = await getOrderByOrderNo(req.params.orderNo)

    if (!order) {
      throw createError(404, '订单不存在', 'ORDER_NOT_FOUND')
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
})

router.post('/dev/unlock', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw createError(403, '生产环境不允许模拟解锁', 'DEV_UNLOCK_DISABLED')
    }

    const { reportId } = req.body || {}
    const report = await requireReport(reportId)

    if (report.unlocked) {
      res.json({ reportId, unlocked: true, report })
      return
    }

    const result = await createDevPaidOrder(reportId)

    res.json({
      reportId,
      unlocked: true,
      order: result.order,
      report: result.report,
    })
  } catch (error) {
    next(error)
  }
})

export default router
