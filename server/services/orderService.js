import prisma from '../lib/prisma.js'
import { REPORT_UNLOCK_AMOUNT } from '../config/payment.js'

const PAY_STATUS = {
  pending: 'pending',
  paid: 'paid',
}

function createOrderNo() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `LX${Date.now()}${random}`
}

export function toOrderDto(order) {
  if (!order) return null

  return {
    id: order.id,
    orderNo: order.orderNo,
    reportId: order.reportId,
    amount: Number(order.amount),
    payStatus: order.payStatus,
    payChannel: order.payChannel,
    alipayTradeNo: order.alipayTradeNo || undefined,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    paidAt: order.paidAt instanceof Date ? order.paidAt.toISOString() : order.paidAt,
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
  }
}

export async function createPaymentOrder({ reportId, payChannel = 'personal_qr' }) {
  const order = await prisma.paymentOrder.create({
    data: {
      orderNo: createOrderNo(),
      reportId,
      amount: REPORT_UNLOCK_AMOUNT,
      payStatus: PAY_STATUS.pending,
      payChannel,
    },
  })

  return toOrderDto(order)
}

export async function getOrderByOrderNo(orderNo) {
  const order = await prisma.paymentOrder.findUnique({
    where: { orderNo },
  })

  return toOrderDto(order)
}

export async function getOrders(query = {}) {
  const page = Math.max(Number(query.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100)
  const where = {}

  if (query.payStatus) {
    where.payStatus = String(query.payStatus)
  }

  if (query.reportId) {
    where.reportId = String(query.reportId)
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

  return {
    list: list.map(toOrderDto),
    total,
    page,
    pageSize,
  }
}

export async function getOrdersByReportId(reportId) {
  const orders = await prisma.paymentOrder.findMany({
    where: { reportId },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map(toOrderDto)
}

export async function markOrderPaid({ orderNo, alipayTradeNo, rawNotify }) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.update({
      where: { orderNo },
      data: {
        payStatus: PAY_STATUS.paid,
        alipayTradeNo: alipayTradeNo || null,
        rawNotify: rawNotify || null,
        paidAt: new Date(),
      },
    })

    const report = await tx.report.update({
      where: { id: order.reportId },
      data: { unlocked: true },
    })

    return { order, report }
  })

  return {
    order: toOrderDto(result.order),
    report: {
      id: result.report.id,
      unlocked: result.report.unlocked,
    },
  }
}

export async function createDevPaidOrder(reportId) {
  const order = await createPaymentOrder({ reportId })
  const result = await markOrderPaid({
    orderNo: order.orderNo,
    alipayTradeNo: `DEV-${order.orderNo}`,
    rawNotify: { source: 'dev-unlock' },
  })

  return result
}

export async function confirmPersonalQrPayment(orderNo) {
  const result = await markOrderPaid({
    orderNo,
    alipayTradeNo: `QR-${orderNo}`,
    rawNotify: { source: 'personal-qr-confirm' },
  })

  return result
}
