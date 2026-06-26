<template>
  <article class="report-poster" aria-label="灵犀阁专属测算海报">
    <div class="poster-stars" aria-hidden="true"></div>
    <div class="astro-ring ring-one" aria-hidden="true"></div>
    <div class="astro-ring ring-two" aria-hidden="true"></div>

    <header class="poster-brand">
      <div class="brand-lockup">
        <span class="brand-mark">灵</span>
        <div>
          <strong>灵犀阁</strong>
          <small>AI玄学测算报告</small>
        </div>
      </div>
      <p>仅供娱乐、文化体验与自我探索参考</p>
    </header>

    <section class="score-panel">
      <div class="score-orb">
        <div class="score-orb-content">
          <span>{{ posterData.score }}</span>
          <small>综合能量评分</small>
        </div>
      </div>
      <div class="score-copy">
        <p>Destiny Insight</p>
        <h1>{{ posterData.type }}</h1>
        <span>{{ posterData.createdAt }}</span>
      </div>
    </section>

    <section class="summary-card glass-block">
      <p class="block-label">核心结论</p>
      <h2>{{ posterData.summary }}</h2>
    </section>

    <section class="signature-card glass-block">
      <p class="block-label">今日专属签语</p>
      <blockquote>{{ posterData.signature }}</blockquote>
    </section>

    <section class="advice-card glass-block">
      <p class="block-label">行动建议</p>
      <p>{{ posterData.advice }}</p>
    </section>

    <footer class="poster-footer">
      <div class="qr-card">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="报告链接二维码" />
        <span v-else></span>
      </div>
      <div>
        <strong>扫码查看完整报告</strong>
        <p>本报告由 AI 生成，仅供娱乐、文化体验与自我探索参考。</p>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  report: {
    type: Object,
    default: null,
  },
  reportUrl: {
    type: String,
    default: '',
  },
})

const qrDataUrl = ref('')

const posterData = computed(() => {
  const report = props.report || {}
  const sections = Array.isArray(report.sections) ? report.sections : []
  const detailSections = Array.isArray(report.detailSections) ? report.detailSections : []
  const allSections = [...sections, ...detailSections]

  const summary = trimText(report.summary || '本次测算显示，你正处在值得认真把握的阶段。', 92)
  const signature = buildSignature(summary, allSections)
  const advice = findAdvice(sections) || findAdvice(detailSections) || '保持稳定节奏，先完成当下最关键的一步，再逐步扩大行动半径。'

  return {
    type: report.type || 'AI 测算',
    score: Number(report.score) || 0,
    summary,
    signature,
    advice: trimText(advice, 112),
    createdAt: formatDate(report.createdAt),
  }
})

async function generateQrCode() {
  const url = props.reportUrl || window.location.href

  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: {
        dark: '#120b21',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
  } catch (error) {
    console.warn('[POSTER_QR_FAILED]', error)
    qrDataUrl.value = ''
  }
}

function findAdvice(sections) {
  const match = sections.find((section) => String(section?.title || '').includes('行动建议'))
  return match?.content || ''
}

function buildSignature(summary, sections) {
  const source = sections.find((section) => section?.content)?.content || summary
  const sentence = String(source).split(/[。！？!?]/).find(Boolean) || summary
  return trimText(sentence.replace(/\s+/g, ''), 34)
}

function trimText(text, maxLength) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized
}

function formatDate(value) {
  if (!value) return '刚刚生成'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚生成'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

watch(() => props.reportUrl, generateQrCode)
onMounted(generateQrCode)
</script>

<style scoped>
.report-poster {
  position: relative;
  width: 1080px;
  min-height: 2200px;
  padding: 76px 72px;
  overflow: hidden;
  color: #f7f1ff;
  background:
    radial-gradient(circle at 76% 10%, rgba(244, 210, 132, 0.24), transparent 24%),
    radial-gradient(circle at 18% 30%, rgba(110, 203, 255, 0.18), transparent 28%),
    linear-gradient(160deg, #08060d 0%, #160923 50%, #06131e 100%);
  font-family: var(--font-sans);
}

.report-poster::before {
  position: absolute;
  inset: 32px;
  pointer-events: none;
  content: "";
  border: 2px solid rgba(244, 210, 132, 0.18);
  border-radius: 36px;
}

.poster-stars {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.8) 0 2px, transparent 2px),
    radial-gradient(circle, rgba(244, 210, 132, 0.72) 0 2px, transparent 2px);
  background-position:
    12px 28px,
    60px 90px;
  background-size:
    138px 138px,
    218px 218px;
  animation: poster-stars-drift 26s linear infinite;
}

.astro-ring {
  position: absolute;
  pointer-events: none;
  border: 2px solid rgba(244, 210, 132, 0.12);
  border-radius: 50%;
}

.ring-one {
  top: 210px;
  right: -160px;
  width: 620px;
  height: 620px;
  box-shadow: inset 0 0 0 28px rgba(244, 210, 132, 0.025);
  animation: poster-ring-spin 42s linear infinite;
}

.ring-two {
  left: -220px;
  bottom: 560px;
  width: 520px;
  height: 520px;
  animation: poster-ring-spin 58s linear infinite reverse;
}

.poster-brand,
.score-panel,
.glass-block,
.poster-footer {
  position: relative;
  z-index: 1;
}

.poster-brand {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 36px;
}

.brand-lockup {
  display: flex;
  gap: 20px;
  align-items: center;
}

.brand-mark {
  display: grid;
  width: 86px;
  height: 86px;
  color: #17100b;
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 900;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, #fff5bf, #f4d284 58%, #9f7434 100%);
  box-shadow: 0 0 42px rgba(244, 210, 132, 0.34);
  place-items: center;
}

.brand-lockup strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 44px;
  line-height: 1.1;
}

.brand-lockup small,
.poster-brand p {
  color: rgba(247, 241, 255, 0.68);
  font-size: 22px;
}

.poster-brand p {
  max-width: 360px;
  margin: 8px 0 0;
  text-align: right;
  line-height: 1.55;
}

.score-panel {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 54px;
  align-items: center;
  margin-top: 120px;
}

.score-orb {
  position: relative;
  display: grid;
  width: 360px;
  height: 360px;
  text-align: center;
  border: 5px solid rgba(244, 210, 132, 0.82);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(244, 210, 132, 0.2), transparent 62%),
    rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 0 60px rgba(244, 210, 132, 0.1),
    0 0 70px rgba(244, 210, 132, 0.22);
  place-items: center;
  animation: poster-score-breathe 4.8s ease-in-out infinite;
}

.score-orb-content {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 100%;
  justify-items: center;
  gap: 16px;
  padding: 0 40px;
  text-align: center;
  transform: translate(-50%, -50%);
}

.score-orb span {
  display: block;
  color: #f4d284;
  font-size: 116px;
  font-weight: 900;
  line-height: 0.95;
}

.score-orb small {
  display: block;
  color: rgba(247, 241, 255, 0.68);
  font-size: 24px;
}

.score-copy p,
.block-label {
  margin: 0 0 16px;
  font-family: var(--font-tech);
  color: #f4d284;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0;
}

.score-copy h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 76px;
  line-height: 1.12;
}

.score-copy span {
  display: inline-flex;
  margin-top: 28px;
  padding: 14px 22px;
  color: rgba(247, 241, 255, 0.72);
  font-size: 24px;
  border: 1px solid rgba(244, 210, 132, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.glass-block {
  padding: 34px 38px;
  border: 2px solid rgba(244, 210, 132, 0.16);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04)),
    rgba(12, 8, 22, 0.72);
  box-shadow: 0 26px 68px rgba(0, 0, 0, 0.26);
}

@keyframes poster-stars-drift {
  from {
    background-position:
      12px 28px,
      60px 90px;
  }

  to {
    background-position:
      -126px 88px,
      278px -70px;
  }
}

@keyframes poster-ring-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes poster-score-breathe {
  0%,
  100% {
    box-shadow:
      inset 0 0 60px rgba(244, 210, 132, 0.1),
      0 0 70px rgba(244, 210, 132, 0.22);
  }

  50% {
    box-shadow:
      inset 0 0 76px rgba(244, 210, 132, 0.16),
      0 0 92px rgba(244, 210, 132, 0.34);
  }
}

.summary-card {
  margin-top: 86px;
}

.summary-card h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 44px;
  line-height: 1.48;
}

.signature-card,
.advice-card {
  margin-top: 28px;
}

.signature-card blockquote {
  margin: 0;
  color: rgba(247, 241, 255, 0.9);
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 800;
  line-height: 1.52;
}

.advice-card p:last-child {
  margin: 0;
  color: rgba(247, 241, 255, 0.78);
  font-size: 32px;
  line-height: 1.72;
}

.poster-footer {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 28px;
  align-items: center;
  margin-top: 48px;
  margin-bottom: 16px;
  padding: 28px;
  border: 2px solid rgba(244, 210, 132, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.06);
}

.qr-card {
  display: grid;
  width: 188px;
  height: 188px;
  padding: 14px;
  border-radius: 22px;
  background: #fff;
  place-items: center;
}

.qr-card img {
  width: 100%;
  height: 100%;
}

.qr-card span {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: rgba(18, 11, 33, 0.08);
}

.poster-footer strong {
  color: #f4d284;
  font-size: 34px;
}

.poster-footer p {
  margin: 12px 0 0;
  color: rgba(247, 241, 255, 0.68);
  font-size: 22px;
  line-height: 1.58;
}
</style>
