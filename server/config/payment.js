export const REPORT_UNLOCK_AMOUNT = '6.66'

export function isExpectedPaymentAmount(amount) {
  const value = Number(amount)

  if (!Number.isFinite(value)) {
    return false
  }

  return value.toFixed(2) === REPORT_UNLOCK_AMOUNT
}
