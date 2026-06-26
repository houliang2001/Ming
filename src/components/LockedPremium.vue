<template>
  <section class="detail-report glass-panel gold-frame">
    <div class="detail-head">
      <div>
        <p class="eyebrow">Deep Report</p>
        <h2>完整深度报告</h2>
        <p>解锁后可查看更细致的趋势拆解、专项分析与个性化建议。</p>
      </div>

      <span :class="['unlock-status', { unlocked }]">
        <LockKeyhole v-if="!unlocked" class="status-icon" />
        <CircleCheck v-else class="status-icon" />
        {{ unlocked ? '已解锁' : '未解锁' }}
      </span>
    </div>

    <div class="detail-shell">
      <div class="detail-grid">
        <article
          v-for="section in displaySections"
          :key="section.title"
          :class="['detail-card', { locked: !unlocked }]"
        >
          <h3>{{ section.title }}</h3>
          <p v-if="unlocked">{{ section.content }}</p>
          <div v-else class="locked-preview" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </article>

        <article :class="['detail-card poster-card', { locked: !unlocked }]">
          <div v-if="!unlocked" class="poster-locked-content">
            <div class="poster-copy">
              <p class="poster-kicker">Poster Benefit</p>
              <h3>解锁后权益：专属测算海报</h3>
              <p>解锁完整报告后，可生成专属高清测算海报，保存你的本次运势结论。</p>
              <ul class="poster-benefits" aria-label="专属测算海报权益">
                <li v-for="benefit in posterBenefits" :key="benefit">
                  <CircleCheck class="benefit-icon" />
                  {{ benefit }}
                </li>
              </ul>
              <button class="ghost-button poster-action" type="button" disabled>
                <ImageDown class="button-icon" />
                解锁完整报告后生成
              </button>
            </div>
            <div class="poster-preview locked-poster" aria-hidden="true">
              <div class="poster-preview-head">
                <span>{{ reportType }}</span>
                <strong>{{ reportScore }}</strong>
              </div>
              <div class="poster-preview-title"></div>
              <div class="poster-preview-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="poster-seal">灵</div>
            </div>
          </div>

          <div v-else class="poster-unlocked-content">
            <div class="poster-preview full-poster" aria-label="专属测算海报预览">
              <div class="poster-preview-head">
                <span>{{ reportType }}</span>
                <strong>{{ reportScore }}</strong>
              </div>
              <h4>{{ posterTitle }}</h4>
              <p>{{ posterSummary }}</p>
              <div class="poster-signature">签语：循光而行，顺势而为</div>
              <div class="poster-seal">灵</div>
            </div>

            <div class="poster-copy">
              <p class="poster-kicker">Poster Studio</p>
              <h3>生成专属测算海报</h3>
              <p>将你的综合评分、核心结论与专属建议生成一张精美海报，适合保存与分享。</p>
              <dl class="poster-meta-list">
                <div>
                  <dt>测算类型</dt>
                  <dd>{{ reportType }}</dd>
                </div>
                <div>
                  <dt>综合评分</dt>
                  <dd>{{ reportScore }}</dd>
                </div>
                <div>
                  <dt>核心结论</dt>
                  <dd>{{ posterSummary }}</dd>
                </div>
                <div>
                  <dt>生成时间</dt>
                  <dd>{{ formattedReportCreatedAt }}</dd>
                </div>
              </dl>
              <div class="poster-actions">
                <button class="primary-button poster-action" type="button" @click="emit('generate-poster')">
                  <Sparkles class="button-icon" />
                  生成海报
                </button>
                <button class="ghost-button poster-action" type="button" @click="emit('generate-poster')">
                  <ImageDown class="button-icon" />
                  保存图片
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="!unlocked" class="pay-overlay">
        <div class="pay-card">
          <div class="premium-badge">
            <LockKeyhole class="badge-icon" />
            完整报告权益
          </div>
          <h3>解锁完整深度报告</h3>
          <div class="premium-price">
            <small>解锁价</small>
            <strong>￥6.66</strong>
          </div>
          <p class="premium-subtitle">解锁后查看完整趋势拆解与个性化建议。</p>
          <ul class="premium-benefit-list" aria-label="完整报告权益">
            <li v-for="benefit in premiumBenefits" :key="benefit">
              <CircleCheck class="benefit-icon" />
              {{ benefit }}
            </li>
          </ul>
          <div class="pay-method-actions">
            <button class="primary-button pay-button" type="button" :disabled="creatingOrder" @click="openPaymentDialog('alipay')">
              <WalletCards class="button-icon" />
              {{ creatingOrder ? '正在创建订单' : '支付宝 6.66 元解锁完整报告' }}
            </button>
            <button class="primary-button pay-button wechat-pay-button" type="button" :disabled="creatingOrder" @click="openPaymentDialog('wechat')">
              <MessageCircle class="button-icon" />
              {{ creatingOrder ? '正在创建订单' : '微信 6.66 元解锁完整报告' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="payment-modal">
        <div v-if="dialogVisible" class="payment-modal-layer" role="dialog" aria-modal="true" aria-labelledby="payment-title">
          <button class="payment-modal-backdrop" type="button" aria-label="关闭支付弹窗" @click="closePaymentDialog"></button>
          <section class="payment-modal" @click.stop>
            <header class="payment-modal-head">
              <div>
                <p class="eyebrow">Pay</p>
                <h3 id="payment-title">扫码支付</h3>
              </div>
              <button class="modal-close" type="button" aria-label="关闭支付弹窗" @click="closePaymentDialog">
                <X class="button-icon" />
              </button>
            </header>

            <div class="payment-modal-body">
              <div class="pay-dialog">
                <p class="amount">¥6.66</p>
                <div class="pay-channel-tabs" role="tablist" aria-label="选择支付方式">
                  <button
                    v-for="channel in paymentChannels"
                    :key="channel.value"
                    :class="['pay-channel-tab', { active: selectedPayChannel === channel.value }]"
                    type="button"
                    role="tab"
                    :aria-selected="selectedPayChannel === channel.value"
                    @click="selectPayChannel(channel.value)"
                  >
                    <component :is="channel.icon" class="button-icon" />
                    {{ channel.label }}
                  </button>
                </div>
                <a class="qr-open-area" :href="qrImageUrl" target="_blank" rel="noopener" aria-label="打开收款码原图">
                  <img class="qr-image" :src="qrImageUrl" alt="个人收款二维码" />
                </a>
                <button class="save-qr-link" type="button" @click="saveQrImage">
                  <Download class="button-icon" />
                  保存{{ selectedPayChannelLabel }}收款码
                </button>
                <small class="save-tip">手机端如未自动下载，可点开图片后长按保存。</small>
                <p>请使用{{ selectedPayChannelLabel }}扫描上方个人收款码，倒计时结束后将自动解锁报告。</p>
                <p class="countdown">
                  {{ countdown > 0 ? `${countdown} 秒后自动解锁` : '正在自动解锁完整报告' }}
                </p>
                <p v-if="orderNo" class="order-no">订单号：{{ orderNo }}</p>
              </div>
            </div>

            <footer class="payment-modal-footer">
              <button
                class="primary-button mock-pay-button"
                type="button"
                :disabled="paying || !orderNo || countdown > 0"
                @click="confirmQrPay"
              >
                {{ paying ? '正在解锁' : countdown > 0 ? `请稍候 ${countdown}s` : '立即解锁报告' }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import CircleCheck from '@lucide/vue/dist/esm/icons/circle-check.mjs'
import Download from '@lucide/vue/dist/esm/icons/download.mjs'
import ImageDown from '@lucide/vue/dist/esm/icons/image-down.mjs'
import LockKeyhole from '@lucide/vue/dist/esm/icons/lock-keyhole.mjs'
import WalletCards from '@lucide/vue/dist/esm/icons/wallet-cards.mjs'
import MessageCircle from '@lucide/vue/dist/esm/icons/message-circle.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import X from '@lucide/vue/dist/esm/icons/x.mjs'
import { confirmPersonalQrPayment, createPersonalQrOrder } from '../utils/aiService'
import { isReportUnlocked, unlockReport } from '../utils/storage'

const props = defineProps({
  reportId: { type: String, required: true },
  reportType: {
    type: String,
    default: 'AI 测算',
  },
  reportScore: {
    type: [Number, String],
    default: 0,
  },
  reportSummary: {
    type: String,
    default: '本次测算已生成你的专属趋势结论。',
  },
  reportCreatedAt: {
    type: [String, Number, Date],
    default: '',
  },
  detailSections: {
    type: Array,
    default: () => [],
  },
  initialUnlocked: {
    type: Boolean,
    default: false,
  },
  useLocalUnlock: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['unlocked', 'generate-poster'])

const dialogVisible = ref(false)
const unlocked = ref(false)
const creatingOrder = ref(false)
const paying = ref(false)
const orderNo = ref('')
const qrImageUrl = ref('/payment-qr.jpg')
const countdown = ref(30)
const selectedPayChannel = ref('alipay')
let countdownTimer = null
let previousBodyOverflow = ''

const paymentChannels = [
  {
    value: 'alipay',
    label: '支付宝',
    icon: WalletCards,
    qrImageUrl: '/payment-qr.jpg',
  },
  {
    value: 'wechat',
    label: '微信',
    icon: MessageCircle,
    qrImageUrl: '/wechat-payment-qr.jpg',
  },
]

const posterBenefits = [
  '展示测算类型',
  '展示综合评分',
  '展示核心结论',
  '展示专属签语',
  '支持保存图片',
]

const premiumBenefits = [
  '未来三个月详细走势',
  '感情专项分析',
  '事业专项分析',
  '财运专项分析',
  '个性化避坑提醒',
  '专属行动建议',
  '专属高清测算海报',
  'AI 深度追问 1 次',
]

const fallbackSections = [
  '未来三个月详细走势',
  '感情专项分析',
  '事业专项分析',
  '财运专项分析',
  '个性化避坑提醒',
  '专属行动建议',
].map((title) => ({
  title,
  content: '正式内容将在解锁后展示。',
}))

const displaySections = computed(() => {
  return props.detailSections?.length ? props.detailSections : fallbackSections
})

const selectedPayChannelConfig = computed(() => {
  return paymentChannels.find((channel) => channel.value === selectedPayChannel.value) || paymentChannels[0]
})

const selectedPayChannelLabel = computed(() => selectedPayChannelConfig.value.label)

const reportType = computed(() => props.reportType || 'AI 测算')
const reportScore = computed(() => Number(props.reportScore) || 0)
const posterSummary = computed(() => props.reportSummary || '本次测算已生成你的专属趋势结论。')
const posterTitle = computed(() => `${reportType.value} · ${reportScore.value} 分`)
const formattedReportCreatedAt = computed(() => {
  if (!props.reportCreatedAt) return '刚刚生成'

  const date = new Date(props.reportCreatedAt)
  if (Number.isNaN(date.getTime())) return '刚刚生成'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})

watch(
  () => [props.reportId, props.initialUnlocked],
  ([reportId, initialUnlocked]) => {
    unlocked.value = Boolean(initialUnlocked || isReportUnlocked(reportId))
  },
  { immediate: true },
)

async function openPaymentDialog(channel = 'alipay') {
  dialogVisible.value = true
  creatingOrder.value = true
  orderNo.value = ''
  selectedPayChannel.value = channel
  qrImageUrl.value = selectedPayChannelConfig.value.qrImageUrl
  startCountdown()

  try {
    const order = await createPersonalQrOrder(props.reportId, selectedPayChannel.value)

    if (order?.unlocked) {
      finishUnlock()
      return
    }

    orderNo.value = order?.orderNo || `LOCAL-${Date.now()}`
    qrImageUrl.value = selectedPayChannelConfig.value.qrImageUrl
  } catch {
    orderNo.value = `LOCAL-${Date.now()}`
    ElMessage.warning('订单接口暂时不可用，请扫码后直接确认解锁')
  } finally {
    creatingOrder.value = false
  }
}

async function confirmQrPay() {
  if (!orderNo.value || countdown.value > 0 || paying.value || unlocked.value) return

  paying.value = true
  const currentOrderNo = orderNo.value

  finishUnlock({ silent: true })
  ElMessage.success('解锁成功，完整报告已开放')

  try {
    if (!currentOrderNo.startsWith('LOCAL-')) {
      await confirmPersonalQrPayment(currentOrderNo)
    }
  } catch (error) {
    console.warn('[PAY_CONFIRM_SYNC_FAILED]', error)
  } finally {
    paying.value = false
  }
}

function finishUnlock(options = {}) {
  unlockReport(props.reportId)
  unlocked.value = true
  dialogVisible.value = false

  window.setTimeout(() => {
    document.querySelector('.detail-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 80)

  if (!options.skipRefresh) {
    window.setTimeout(() => {
      emit('unlocked', props.reportId)
    }, 1200)
  }

  if (!options.silent) {
    ElMessage.success('解锁成功，完整报告已开放')
  }
}

function saveQrImage() {
  const opened = window.open(qrImageUrl.value, '_blank', 'noopener')
  const link = document.createElement('a')
  link.href = qrImageUrl.value
  link.download = selectedPayChannel.value === 'wechat' ? 'lingxige-wechat-payment-qr.jpg' : 'lingxige-alipay-payment-qr.jpg'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.info(opened ? '已打开收款码图片，请长按图片保存' : '如未自动保存，请长按上方收款码图片保存')
}

function selectPayChannel(channel) {
  selectedPayChannel.value = channel
  qrImageUrl.value = selectedPayChannelConfig.value.qrImageUrl
}

function closePaymentDialog() {
  dialogVisible.value = false
  resetPaymentDialog()
}

function startCountdown() {
  clearCountdown()
  countdown.value = 30
  countdownTimer = window.setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1)
    if (countdown.value === 0) {
      clearCountdown()
      confirmQrPay()
    }
  }, 1000)
}

function clearCountdown() {
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function resetPaymentDialog() {
  clearCountdown()
  countdown.value = 30
  paying.value = false
  creatingOrder.value = false
}

watch(dialogVisible, (visible) => {
  if (visible) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  clearCountdown()
  document.body.style.overflow = previousBodyOverflow
})
</script>

<style scoped>
.detail-report {
  margin-top: 28px;
  padding: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 10%, rgba(245, 203, 115, 0.14), transparent 28%),
    radial-gradient(circle at 8% 18%, rgba(110, 203, 255, 0.1), transparent 30%),
    rgba(12, 8, 22, 0.8);
}

.detail-head {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--gold);
  font-weight: 800;
  letter-spacing: 0;
}

h2 {
  margin: 0 0 10px;
  font-size: 28px;
}

.detail-head p {
  max-width: 620px;
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

.unlock-status {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 9px 13px;
  color: var(--gold);
  white-space: nowrap;
  border: 1px solid rgba(245, 203, 115, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.unlock-status.unlocked {
  color: var(--teal);
  border-color: rgba(121, 242, 223, 0.34);
}

.status-icon {
  width: 18px;
  height: 18px;
}

.detail-shell {
  position: relative;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-card {
  position: relative;
  min-height: 218px;
  padding: 22px;
  overflow: hidden;
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.055);
  box-shadow:
    inset 0 0 28px rgba(245, 203, 115, 0.035),
    0 18px 44px rgba(0, 0, 0, 0.18);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.detail-card::after {
  position: absolute;
  right: -44px;
  bottom: -44px;
  width: 118px;
  height: 118px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.12);
  border-radius: 50%;
}

.detail-card:hover {
  border-color: rgba(245, 203, 115, 0.32);
  box-shadow:
    inset 0 0 34px rgba(245, 203, 115, 0.05),
    0 22px 58px rgba(0, 0, 0, 0.26),
    0 0 28px rgba(245, 203, 115, 0.08);
  transform: translateY(-2px);
}

.detail-card.locked {
  min-height: 158px;
}

.detail-card h3 {
  margin: 0 0 12px;
  color: var(--gold);
  font-size: 20px;
  line-height: 1.35;
}

.detail-card p {
  margin: 0;
  color: rgba(247, 241, 255, 0.76);
  line-height: 1.9;
  white-space: pre-line;
  word-break: break-word;
}

.poster-card {
  grid-column: 1 / -1;
}

.poster-locked-content,
.poster-unlocked-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.52fr);
  gap: 22px;
  align-items: center;
}

.poster-unlocked-content {
  grid-template-columns: minmax(220px, 0.46fr) minmax(0, 1fr);
}

.poster-copy {
  display: grid;
  gap: 14px;
  align-content: center;
}

.poster-kicker {
  margin: 0;
  color: rgba(245, 203, 115, 0.82);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.poster-card .poster-copy h3 {
  margin: 0;
  font-size: 24px;
}

.poster-card .poster-copy p {
  max-width: 680px;
  line-height: 1.8;
}

.poster-benefits {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0;
  margin: 4px 0 0;
  list-style: none;
}

.poster-benefits li {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 8px 10px;
  color: rgba(247, 241, 255, 0.78);
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.045);
}

.benefit-icon {
  width: 16px;
  height: 16px;
  color: var(--gold);
  flex: 0 0 auto;
}

.poster-preview {
  position: relative;
  display: grid;
  min-height: 320px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(245, 203, 115, 0.24);
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 18%, rgba(245, 203, 115, 0.18), transparent 32%),
    radial-gradient(circle at 82% 78%, rgba(110, 203, 255, 0.14), transparent 34%),
    linear-gradient(160deg, rgba(20, 11, 34, 0.96), rgba(8, 6, 16, 0.98));
  box-shadow:
    inset 0 0 36px rgba(245, 203, 115, 0.05),
    0 22px 54px rgba(0, 0, 0, 0.28),
    0 0 28px rgba(245, 203, 115, 0.08);
  animation: poster-card-float 5.4s ease-in-out infinite;
}

.poster-preview::before {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: var(--radius-md);
}

.poster-preview-head {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  align-self: start;
  color: rgba(247, 241, 255, 0.78);
  font-size: 13px;
  font-weight: 800;
}

.poster-preview-head strong {
  display: grid;
  width: 54px;
  height: 54px;
  color: #17100b;
  font-size: 24px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 24px rgba(245, 203, 115, 0.34);
  place-items: center;
  animation: poster-score-glow 3.8s ease-in-out infinite;
}

.poster-preview h4 {
  position: relative;
  z-index: 1;
  align-self: center;
  margin: 28px 0 0;
  color: var(--gold);
  font-size: 24px;
  line-height: 1.35;
}

.poster-preview p {
  position: relative;
  z-index: 1;
  margin: 12px 0 0;
  color: rgba(247, 241, 255, 0.72);
  font-size: 14px;
  line-height: 1.75;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.poster-preview-title {
  position: relative;
  z-index: 1;
  width: 78%;
  height: 30px;
  margin-top: 42px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(245, 203, 115, 0.36), rgba(255, 255, 255, 0.1));
}

.poster-preview-lines {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.poster-preview-lines span {
  height: 10px;
  border-radius: 999px;
  background: rgba(247, 241, 255, 0.14);
}

.poster-preview-lines span:nth-child(2) {
  width: 82%;
}

.poster-preview-lines span:nth-child(3) {
  width: 62%;
}

.poster-signature {
  position: relative;
  z-index: 1;
  align-self: end;
  margin-top: 20px;
  padding: 10px 12px;
  color: rgba(245, 203, 115, 0.9);
  font-size: 13px;
  border: 1px solid rgba(245, 203, 115, 0.18);
  border-radius: var(--radius-md);
  background: rgba(245, 203, 115, 0.08);
}

.poster-seal {
  position: absolute;
  right: 18px;
  bottom: 16px;
  display: grid;
  width: 42px;
  height: 42px;
  color: #17100b;
  font-weight: 900;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 24px rgba(245, 203, 115, 0.28);
  place-items: center;
}

.locked-poster {
  opacity: 0.72;
  filter: saturate(0.86);
}

.poster-meta-list {
  display: grid;
  gap: 10px;
  margin: 4px 0 0;
}

.poster-meta-list div {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.045);
}

.poster-meta-list dt {
  color: rgba(245, 203, 115, 0.86);
  font-weight: 800;
}

.poster-meta-list dd {
  margin: 0;
  color: rgba(247, 241, 255, 0.74);
  line-height: 1.6;
}

.poster-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.poster-action {
  min-height: 42px;
  padding: 0 18px;
  font-weight: 800;
}

.poster-action:disabled {
  cursor: not-allowed;
  opacity: 0.64;
  transform: none;
}

.locked-preview {
  display: grid;
  gap: 9px;
  opacity: 0.62;
  filter: blur(2px);
}

.locked-preview span {
  display: block;
  height: 11px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(245, 203, 115, 0.16), rgba(255, 255, 255, 0.08));
  background-size: 180px 100%;
  animation: locked-line-flow 2.8s linear infinite;
}

.locked-preview span:nth-child(2) {
  width: 84%;
}

.locked-preview span:nth-child(3) {
  width: 68%;
}

.pay-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  padding: 22px;
  pointer-events: none;
  background: rgba(7, 5, 12, 0.38);
  backdrop-filter: blur(4px);
  place-items: center;
}

.pay-card {
  display: grid;
  width: min(640px, 100%);
  padding: 26px;
  pointer-events: auto;
  text-align: left;
  border: 1px solid rgba(245, 203, 115, 0.34);
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 203, 115, 0.16), transparent 48%),
    rgba(16, 10, 28, 0.92);
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.38), 0 0 36px rgba(245, 203, 115, 0.1);
  justify-items: stretch;
}

.premium-badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-self: start;
  padding: 8px 12px;
  color: #17100b;
  font-size: 13px;
  font-weight: 900;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff2b8, #f4d284 56%, #b98b3e);
  box-shadow: 0 12px 28px rgba(245, 203, 115, 0.18);
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.pay-icon,
.badge-icon {
  color: var(--gold);
  filter: drop-shadow(0 0 14px rgba(245, 203, 115, 0.45));
}

.pay-card h3 {
  margin: 18px 0 8px;
  font-size: 27px;
}

.premium-price {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 8px;
}

.premium-price small {
  color: var(--muted);
  font-weight: 800;
}

.premium-price strong {
  color: var(--gold);
  font-size: 34px;
  line-height: 1;
  text-shadow: 0 0 20px rgba(245, 203, 115, 0.26);
}

.premium-subtitle {
  margin: 0 0 16px;
  color: rgba(247, 241, 255, 0.72);
  line-height: 1.7;
}

.premium-benefit-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  padding: 0;
  margin: 0 0 18px;
  list-style: none;
}

.premium-benefit-list li {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 8px 10px;
  color: rgba(247, 241, 255, 0.78);
  font-size: 14px;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.045);
}

.pay-method-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.pay-button,
.mock-pay-button {
  min-height: 46px;
  padding: 0 24px;
  font-weight: 800;
}

.wechat-pay-button {
  background: linear-gradient(135deg, #d9ffe8, #53e28a 54%, #0aac56);
  box-shadow: 0 12px 30px rgba(83, 226, 138, 0.22);
}

.pay-button:disabled,
.mock-pay-button:disabled {
  cursor: wait;
  opacity: 0.68;
}

.payment-modal-layer {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  height: 100vh;
  height: 100dvh;
  padding: max(12px, env(safe-area-inset-top, 0px)) 12px max(12px, env(safe-area-inset-bottom, 0px));
  place-items: center;
}

.payment-modal-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(5, 3, 10, 0.74);
  backdrop-filter: blur(8px);
}

.payment-modal {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(560px, 100%);
  max-height: min(92vh, 820px);
  max-height: min(92dvh, 820px);
  overflow: hidden;
  border: 1px solid rgba(245, 203, 115, 0.3);
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 203, 115, 0.12), transparent 42%),
    #120b21;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.62);
}

.payment-modal-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 10px;
  border-bottom: 1px solid rgba(245, 203, 115, 0.12);
}

.payment-modal-head h3 {
  margin: 0;
  font-size: 22px;
}

.modal-close {
  display: grid;
  width: 38px;
  height: 38px;
  color: var(--text);
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.24);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  place-items: center;
}

.payment-modal-body {
  min-height: 0;
  padding: 14px 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.payment-modal-footer {
  padding: 12px 20px 18px;
  border-top: 1px solid rgba(245, 203, 115, 0.12);
  background: rgba(18, 11, 33, 0.96);
}

.pay-dialog {
  display: grid;
  gap: 12px;
  text-align: center;
}

.pay-dialog .amount {
  margin: 0;
  color: var(--gold);
  font-size: 38px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 20px rgba(245, 203, 115, 0.32);
}

.pay-dialog p {
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

.pay-channel-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pay-channel-tab {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 14px;
  color: var(--muted);
  font-weight: 800;
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.pay-channel-tab.active {
  color: #17100b;
  border-color: var(--gold);
  background: linear-gradient(135deg, #fff2b8, #f4d284 54%, #b98b3e);
}

.qr-open-area {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  border-radius: var(--radius-md);
}

.qr-image {
  display: block;
  width: auto;
  max-width: min(360px, 78vw);
  max-height: min(52vh, 520px);
  max-height: min(52dvh, 520px);
  height: auto;
  object-fit: contain;
  margin: 0 auto;
  padding: 8px;
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: var(--radius-md);
  background: #fff;
  animation: qr-pop-in 0.42s var(--motion-ease) both;
}

.save-qr-link {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin: 0 auto 14px;
  padding: 0 16px;
  color: var(--gold);
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.34);
  border-radius: 999px;
  background: rgba(245, 203, 115, 0.1);
}

.save-qr-link:hover {
  border-color: rgba(245, 203, 115, 0.58);
  background: rgba(245, 203, 115, 0.16);
}

.save-tip {
  margin-top: -8px;
  color: rgba(247, 241, 255, 0.56);
  font-size: 12px;
  line-height: 1.5;
}

.countdown {
  margin-top: 12px !important;
  color: var(--gold) !important;
  font-weight: 800;
}

.order-no {
  margin-top: 12px !important;
  color: rgba(247, 241, 255, 0.68) !important;
  font-size: 13px;
}

.payment-modal-enter-active,
.payment-modal-leave-active {
  transition: opacity 0.18s ease;
}

@keyframes poster-card-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@keyframes poster-score-glow {
  0%,
  100% {
    box-shadow: 0 0 24px rgba(245, 203, 115, 0.34);
  }

  50% {
    box-shadow: 0 0 36px rgba(245, 203, 115, 0.52);
  }
}

@keyframes locked-line-flow {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 180px 0;
  }
}

@keyframes qr-pop-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.payment-modal-enter-active .payment-modal,
.payment-modal-leave-active .payment-modal {
  transition: transform 0.18s ease;
}

.payment-modal-enter-from,
.payment-modal-leave-to {
  opacity: 0;
}

.payment-modal-enter-from .payment-modal,
.payment-modal-leave-to .payment-modal {
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 820px) {
  .detail-head,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-head {
    flex-direction: column;
  }

  .poster-locked-content,
  .poster-unlocked-content {
    grid-template-columns: 1fr;
  }

  .poster-unlocked-content .poster-preview {
    order: 2;
  }

  .poster-unlocked-content .poster-copy {
    order: 1;
  }
}

@media (max-width: 560px) {
  .detail-report {
    margin-top: 22px;
    padding: 18px;
  }

  h2 {
    font-size: 22px;
  }

  .detail-card {
    min-height: auto;
    padding: 18px;
  }

  .detail-card h3 {
    font-size: 18px;
  }

  .detail-card p {
    font-size: 15px;
    line-height: 1.78;
  }

  .poster-card .poster-copy h3 {
    font-size: 20px;
  }

  .poster-benefits {
    grid-template-columns: 1fr;
  }

  .poster-preview {
    min-height: 280px;
    padding: 18px;
  }

  .poster-preview h4 {
    font-size: 21px;
  }

  .poster-preview-head strong {
    width: 48px;
    height: 48px;
    font-size: 21px;
  }

  .poster-meta-list div {
    grid-template-columns: 78px minmax(0, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .poster-actions,
  .poster-action {
    width: 100%;
  }

  .pay-overlay {
    padding: 14px;
  }

  .pay-card {
    padding: 22px 18px;
  }

  .pay-card h3 {
    font-size: 22px;
  }

  .premium-price strong {
    font-size: 28px;
  }

  .premium-benefit-list {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .premium-benefit-list li {
    min-height: 36px;
    font-size: 13px;
  }

  .pay-method-actions {
    grid-template-columns: 1fr;
  }

  .pay-button,
  .mock-pay-button {
    width: 100%;
    padding: 0 16px;
  }

  .payment-modal-layer {
    align-items: end;
    padding: max(8px, env(safe-area-inset-top, 0px)) 8px max(8px, env(safe-area-inset-bottom, 0px));
  }

  .payment-modal {
    width: 100%;
    max-height: calc(100vh - 18px);
    max-height: calc(100dvh - 18px);
  }

  .payment-modal-head {
    padding: 12px 14px 8px;
  }

  .payment-modal-head h3 {
    font-size: 19px;
  }

  .payment-modal-body {
    padding: 10px 12px;
  }

  .payment-modal-footer {
    padding: 10px 12px 12px;
  }

  .qr-image {
    max-width: min(300px, 76vw);
    max-height: 46vh;
    max-height: 46dvh;
  }

  .pay-dialog .amount {
    margin-bottom: 0;
    font-size: 30px;
  }

  .pay-channel-tabs {
    gap: 8px;
  }

  .pay-channel-tab {
    min-height: 40px;
    padding: 0 10px;
    font-size: 14px;
  }

  .pay-dialog p {
    font-size: 14px;
  }
}

@media (max-width: 380px) {
  .qr-image {
    max-width: min(260px, 74vw);
    max-height: 42vh;
    max-height: 42dvh;
  }
}
</style>
