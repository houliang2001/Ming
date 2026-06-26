<template>
  <section v-if="loading" class="page narrow">
    <div class="empty-panel glass-panel gold-frame">
      <Sparkles class="empty-icon" />
      <h1>正在读取报告</h1>
      <p>正在同步你的 AI 测算结果与解锁状态。</p>
    </div>
  </section>

  <section v-else-if="report" class="page result-page">
    <header class="report-hero glass-panel gold-frame">
      <div class="hero-copy">
        <p class="eyebrow">{{ report.type }}</p>
        <h1>{{ report.summary }}</h1>
        <div class="report-meta">
          <span>测算类型：{{ report.type }}</span>
          <span>灵犀阁报告编号：{{ displayReportNo }}</span>
          <span>生成时间：{{ formatDate(report.createdAt) }}</span>
          <span>报告来源：AI 生成</span>
        </div>
      </div>

      <div class="score-orbit" aria-label="综合评分">
        <el-progress type="dashboard" :percentage="report.score" :width="146" color="#f4d284">
          <template #default="{ percentage }">
            <span class="score-orbit-content">
              <strong>{{ percentage }}</strong>
              <small>综合评分</small>
            </span>
          </template>
        </el-progress>
      </div>
    </header>

    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Free Report</p>
          <h2 class="section-title">{{ unlocked ? '完整基础报告' : '免费基础报告' }}</h2>
        </div>
        <p class="section-lead">
          {{ unlocked ? '完整报告已解锁，基础分析内容已全部开放。' : '免费版已开放核心结论与部分基础分析，完整趋势与专项建议需解锁查看。' }}
        </p>
      </div>

      <div class="section-grid">
        <article
          v-for="(section, index) in displaySections"
          :key="`${section.title}-${index}`"
          :class="['analysis-card glass-card', { limited: section.isLimited }]"
        >
          <div class="card-index">{{ String(index + 1).padStart(2, '0') }}</div>
          <h3>{{ section.title }}</h3>
          <p>{{ section.content }}</p>
          <div v-if="section.isLimited" class="limited-hint">
            <Sparkles class="hint-icon" />
            解锁后查看完整建议
          </div>
        </article>
      </div>

      <div v-if="!unlocked" class="free-upgrade-note glass-card">
        <Sparkles class="upgrade-icon" />
        <p>
          你已查看基础报告。解锁完整报告后，可查看未来三个月走势、感情 / 事业 / 财运专项分析、
          个性化避坑提醒、专属测算海报与 1 次 AI 深度追问。
        </p>
      </div>
    </section>

    <LockedPremium
      :report-id="report.id"
      :report-type="report.type"
      :report-score="report.score"
      :report-summary="report.summary"
      :report-created-at="report.createdAt"
      :detail-sections="report.detailSections"
      :initial-unlocked="unlocked"
      :use-local-unlock="usingLocalReport"
      @unlocked="refreshUnlockState"
      @generate-poster="openPosterDialog"
    />

    <el-dialog
      v-model="posterDialogVisible"
      class="poster-dialog"
      title="专属测算海报"
      width="min(920px, 94vw)"
      top="4vh"
      append-to-body
    >
      <div v-if="report" class="poster-dialog-body">
        <div class="poster-preview-shell">
          <ReportPoster ref="posterRef" :report="report" :report-url="reportUrl" />
        </div>
      </div>
      <p v-else class="poster-empty">报告数据不存在，无法生成海报</p>

      <template #footer>
        <div class="poster-dialog-actions">
          <button class="primary-button poster-dialog-button" type="button" :disabled="posterGenerating || !report" @click="handleDownloadPoster">
            <Download class="button-icon" />
            {{ posterGenerating ? '生成中...' : '下载海报' }}
          </button>
          <button class="ghost-button poster-dialog-button" type="button" @click="handleCopyReportLink">
            <Copy class="button-icon" />
            复制链接
          </button>
          <button v-if="canShare" class="ghost-button poster-dialog-button" type="button" @click="handleShareReport">
            <Share2 class="button-icon" />
            分享报告
          </button>
          <button class="ghost-button poster-dialog-button" type="button" @click="posterDialogVisible = false">
            关闭
          </button>
        </div>
      </template>
    </el-dialog>

    <section class="report-disclaimer glass-panel">
      <ShieldAlert class="disclaimer-icon" />
      <p>
        本报告由 AI 生成，仅供娱乐、文化体验与自我探索参考，不作为医学、法律、投资、婚姻或人生重大决策依据。
      </p>
    </section>

    <div class="result-actions">
      <RouterLink class="ghost-button result-link" to="/history">
        <History class="button-icon" />
        查看历史记录
      </RouterLink>
      <RouterLink class="primary-button result-link" to="/">
        <Sparkles class="button-icon" />
        再测一次
      </RouterLink>
    </div>
  </section>

  <section v-else class="page narrow">
    <div class="empty-panel glass-panel gold-frame">
      <Sparkles class="empty-icon" />
      <h1>未找到报告</h1>
      <p>这份报告可能已被清除，或当前浏览器没有保存对应记录。</p>
      <RouterLink class="primary-button result-link" to="/">
        返回首页
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import Copy from '@lucide/vue/dist/esm/icons/copy.mjs'
import Download from '@lucide/vue/dist/esm/icons/download.mjs'
import History from '@lucide/vue/dist/esm/icons/history.mjs'
import Share2 from '@lucide/vue/dist/esm/icons/share-2.mjs'
import ShieldAlert from '@lucide/vue/dist/esm/icons/shield-alert.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import LockedPremium from '../components/LockedPremium.vue'
import ReportPoster from '../components/ReportPoster.vue'
import { fetchReportById } from '../utils/aiService'
import { copyReportLink, downloadPoster } from '../utils/posterService'
import { getReportById, isReportUnlocked, saveReport, unlockReport } from '../utils/storage'

const route = useRoute()
const report = ref(null)
const unlocked = ref(false)
const loading = ref(false)
const usingLocalReport = ref(false)
const posterDialogVisible = ref(false)
const posterGenerating = ref(false)
const posterRef = ref(null)
const reportUrl = ref('')
const canShare = computed(() => typeof navigator !== 'undefined' && Boolean(navigator.share))
const displayReportNo = computed(() => report.value?.reportNo || report.value?.id || '生成中')
const displaySections = computed(() => {
  const sections = Array.isArray(report.value?.sections) ? report.value.sections : []

  if (unlocked.value) return sections

  return sections.slice(0, 3).map((section) => {
    const isAdvice = String(section?.title || '').includes('行动建议')
    const content = String(section?.content || '')

    if (!isAdvice || content.length <= 120) {
      return section
    }

    return {
      ...section,
      content: `${content.slice(0, 110)}...`,
      isLimited: true,
    }
  })
})

watch(
  () => route.params.id,
  (id) => {
    loadReport(String(id || ''))
  },
  { immediate: true },
)

async function loadReport(reportId) {
  if (!reportId) {
    report.value = null
    unlocked.value = false
    usingLocalReport.value = false
    return
  }

  loading.value = true

  try {
    const remoteReport = await fetchReportById(reportId)
    const localUnlocked = isReportUnlocked(remoteReport.id)
    const normalizedReport = {
      ...remoteReport,
      unlocked: Boolean(remoteReport.unlocked || localUnlocked),
    }
    report.value = normalizedReport
    unlocked.value = normalizedReport.unlocked
    usingLocalReport.value = false
    saveReport(normalizedReport)

    if (normalizedReport.unlocked) {
      unlockReport(normalizedReport.id)
    }
  } catch {
    const cachedReport = getReportById(reportId)
    report.value = cachedReport
    unlocked.value = cachedReport ? Boolean(cachedReport.unlocked || isReportUnlocked(cachedReport.id)) : false
    usingLocalReport.value = Boolean(cachedReport)
  } finally {
    loading.value = false
  }
}

async function refreshUnlockState(reportId) {
  if (reportId) {
    unlockReport(reportId)
  }

  if (report.value?.id === reportId) {
    report.value = {
      ...report.value,
      unlocked: true,
    }
    unlocked.value = true
    saveReport(report.value)
  }

  await loadReport(reportId)
}

async function openPosterDialog() {
  if (!report.value) {
    ElMessage.warning('报告数据不存在，无法生成海报')
    return
  }

  const reportUnlocked = Boolean(unlocked.value || report.value.unlocked || isReportUnlocked(report.value.id))

  if (!reportUnlocked) {
    ElMessage.info('请先解锁完整报告后生成专属海报')
    return
  }

  unlocked.value = true
  report.value = {
    ...report.value,
    unlocked: true,
  }
  saveReport(report.value)
  reportUrl.value = window.location.href
  posterDialogVisible.value = true
  await nextTick()
}

async function handleDownloadPoster() {
  if (!report.value) {
    ElMessage.warning('报告数据不存在，无法生成海报')
    return
  }

  const posterElement = posterRef.value?.$el?.classList?.contains('report-poster')
    ? posterRef.value.$el
    : posterRef.value?.$el?.querySelector?.('.report-poster')
  if (!posterElement) {
    ElMessage.warning('报告数据不存在，无法生成海报')
    return
  }

  posterGenerating.value = true

  try {
    await downloadPoster(posterElement, `lingxige-report-${report.value.id}.png`)
    ElMessage.success('海报已生成并开始下载')
  } catch (error) {
    ElMessage.error(error?.message || '海报生成失败，请稍后重试')
  } finally {
    posterGenerating.value = false
  }
}

async function handleCopyReportLink() {
  try {
    await copyReportLink(reportUrl.value || window.location.href)
    ElMessage.success('报告链接已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制浏览器地址')
  }
}

async function handleShareReport() {
  if (!navigator.share) return

  try {
    await navigator.share({
      title: '灵犀阁测算报告',
      text: report.value?.summary || '我的灵犀阁 AI 测算报告',
      url: reportUrl.value || window.location.href,
    })
  } catch (error) {
    if (error?.name !== 'AbortError') {
      ElMessage.info('分享未完成，可复制链接后发送')
    }
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
</script>

<style scoped>
.result-page {
  padding-top: 34px;
}

.report-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 30px;
  align-items: center;
  padding: 34px;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 16%, rgba(110, 203, 255, 0.14), transparent 30%),
    radial-gradient(circle at 18% 22%, rgba(244, 210, 132, 0.13), transparent 28%),
    rgba(12, 8, 22, 0.78);
}

.report-hero::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background: linear-gradient(115deg, transparent 0 36%, rgba(255, 236, 188, 0.1) 46%, transparent 56%);
  background-size: 240% 100%;
  animation: report-hero-sheen 7s ease-in-out infinite;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--gold);
  font-weight: 800;
  letter-spacing: 0;
}

.hero-copy h1 {
  max-width: 860px;
  margin: 0;
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.55;
  word-break: break-word;
}

.report-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
  color: var(--muted);
  font-size: 14px;
}

.report-meta span {
  max-width: 100%;
  padding: 8px 12px;
  overflow-wrap: anywhere;
  border: 1px solid rgba(244, 210, 132, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
}

.score-orbit {
  position: relative;
  display: grid;
  min-width: 172px;
  min-height: 172px;
  border: 1px solid rgba(244, 210, 132, 0.24);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 210, 132, 0.12), transparent 62%);
  box-shadow: 0 0 38px rgba(244, 210, 132, 0.16);
  place-items: center;
  animation: score-breathe 4.6s ease-in-out infinite;
}

.score-orbit::before {
  position: absolute;
  inset: -9px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(244, 210, 132, 0.18);
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(244, 210, 132, 0.28), transparent 28%, rgba(121, 242, 223, 0.12), transparent 64%, rgba(244, 210, 132, 0.22), transparent);
  mask-image: radial-gradient(circle, transparent 0 70%, #000 71% 78%, transparent 79%);
  animation: score-spin 18s linear infinite;
}

.score-orbit :deep(.el-progress) {
  display: grid;
  place-items: center;
}

.score-orbit :deep(.el-progress__text) {
  display: grid;
  place-items: center;
}

.score-orbit-content {
  display: grid;
  justify-items: center;
  gap: 6px;
  text-align: center;
}

.score-orbit strong {
  display: block;
  color: var(--gold);
  font-size: 36px;
  line-height: 1;
  text-shadow: 0 0 18px rgba(244, 210, 132, 0.36);
}

.score-orbit small {
  display: block;
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
}

.content-section {
  margin-top: 30px;
}

.section-heading {
  display: flex;
  gap: 18px;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
}

.section-lead {
  max-width: 420px;
  text-align: right;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.analysis-card {
  position: relative;
  min-height: 260px;
  padding: 24px;
  overflow: hidden;
  border-color: rgba(244, 210, 132, 0.18);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.34),
    inset 0 0 28px rgba(110, 203, 255, 0.035);
  animation: report-card-rise 0.72s var(--motion-ease) both;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.analysis-card:nth-child(2) {
  animation-delay: 80ms;
}

.analysis-card:nth-child(3) {
  animation-delay: 160ms;
}

.analysis-card:nth-child(4) {
  animation-delay: 240ms;
}

.analysis-card:hover {
  border-color: rgba(244, 210, 132, 0.34);
  box-shadow:
    0 26px 72px rgba(0, 0, 0, 0.42),
    0 0 34px rgba(244, 210, 132, 0.08),
    inset 0 0 34px rgba(110, 203, 255, 0.045);
  transform: translateY(-3px);
}

.analysis-card.limited::before {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 46%;
  pointer-events: none;
  content: "";
  background: linear-gradient(180deg, rgba(12, 8, 22, 0), rgba(12, 8, 22, 0.9));
}

.analysis-card::after {
  position: absolute;
  right: -42px;
  bottom: -42px;
  width: 130px;
  height: 130px;
  content: "";
  border: 1px solid rgba(244, 210, 132, 0.15);
  border-radius: 50%;
}

.card-index {
  display: grid;
  width: 38px;
  height: 38px;
  color: #17100b;
  font-weight: 800;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 18px rgba(244, 210, 132, 0.28);
  place-items: center;
}

.analysis-card h3 {
  margin: 18px 0 12px;
  font-size: 21px;
  font-weight: 800;
}

.analysis-card p {
  margin: 0;
  color: rgba(247, 241, 255, 0.74);
  line-height: 1.9;
  word-break: break-word;
}

.limited-hint {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-top: 18px;
  padding: 9px 12px;
  color: #17100b;
  font-weight: 900;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff2b8, #f4d284 56%, #b98b3e);
  box-shadow: 0 12px 28px rgba(244, 210, 132, 0.18);
}

.hint-icon {
  width: 16px;
  height: 16px;
}

.free-upgrade-note {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-top: 16px;
  padding: 18px 20px;
  border-color: rgba(244, 210, 132, 0.22);
  background:
    radial-gradient(circle at 8% 0%, rgba(244, 210, 132, 0.12), transparent 34%),
    rgba(255, 255, 255, 0.055);
}

.upgrade-icon {
  width: 22px;
  height: 22px;
  color: var(--gold);
  flex: 0 0 auto;
  filter: drop-shadow(0 0 12px rgba(244, 210, 132, 0.32));
}

.free-upgrade-note p {
  margin: 0;
  color: rgba(247, 241, 255, 0.78);
  line-height: 1.8;
}

.report-disclaimer {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-top: 24px;
  padding: 20px 22px;
  border-color: rgba(244, 210, 132, 0.18);
}

.disclaimer-icon {
  width: 22px;
  height: 22px;
  color: var(--gold);
  flex: 0 0 auto;
}

.report-disclaimer p {
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
  flex-wrap: wrap;
}

.result-link {
  min-height: 44px;
  padding: 0 22px;
  font-weight: 700;
}

.empty-panel {
  display: grid;
  min-height: 380px;
  padding: 34px;
  text-align: center;
  place-items: center;
}

.empty-icon {
  width: 42px;
  height: 42px;
  color: var(--gold);
}

.empty-panel h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 32px;
}

.empty-panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}

.poster-dialog-body {
  display: grid;
  justify-items: center;
}

.poster-preview-shell {
  width: 360px;
  height: 640px;
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid rgba(244, 210, 132, 0.28);
  border-radius: var(--radius-lg);
  background: rgba(9, 7, 15, 0.9);
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.42);
  animation: poster-preview-in 0.58s var(--motion-ease) both;
}

.poster-preview-shell :deep(.report-poster) {
  transform: scale(0.333333);
  transform-origin: top left;
}

.poster-preview-shell :deep(.report-poster::before) {
  inset: 32px;
}

.poster-empty {
  margin: 0;
  color: var(--muted);
  text-align: center;
}

.poster-dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.poster-dialog-button {
  min-height: 42px;
  padding: 0 18px;
  font-weight: 800;
}

@keyframes report-hero-sheen {
  0%,
  100% {
    background-position: -140% 0;
    opacity: 0;
  }

  45%,
  55% {
    background-position: 160% 0;
    opacity: 1;
  }
}

@keyframes score-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes score-breathe {
  0%,
  100% {
    box-shadow: 0 0 38px rgba(244, 210, 132, 0.16);
  }

  50% {
    box-shadow: 0 0 58px rgba(244, 210, 132, 0.28);
  }
}

@keyframes report-card-rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes poster-preview-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 860px) {
  .report-hero,
  .section-grid {
    grid-template-columns: 1fr;
  }

  .score-orbit {
    justify-self: start;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .section-lead {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .result-page {
    padding-top: 22px;
  }

  .report-hero {
    gap: 20px;
    padding: 20px;
  }

  .hero-copy h1 {
    font-size: 21px;
    line-height: 1.62;
    font-weight: 800;
  }

  .report-meta {
    display: grid;
    gap: 10px;
    margin-top: 16px;
    font-size: 13px;
  }

  .report-meta span {
    border-radius: 8px;
  }

  .score-orbit {
    justify-self: center;
    min-width: 146px;
    min-height: 146px;
    transform: scale(0.92);
    transform-origin: center;
  }

  .content-section {
    margin-top: 24px;
  }

  .section-heading {
    margin-bottom: 14px;
  }

  .analysis-card {
    min-height: auto;
    padding: 18px;
  }

  .analysis-card h3 {
    margin: 14px 0 10px;
    font-size: 19px;
  }

  .analysis-card p {
    font-size: 15px;
    line-height: 1.78;
  }

  .report-disclaimer {
    flex-direction: column;
    padding: 18px;
  }

  .result-actions {
    display: grid;
  }

  .result-link {
    width: 100%;
  }

  :global(.poster-dialog.el-dialog) {
    width: calc(100vw - 18px) !important;
    max-height: calc(100vh - 24px);
    margin-top: 12px !important;
    overflow: hidden;
  }

  :global(.poster-dialog .el-dialog__body) {
    max-height: calc(100vh - 162px);
    padding: 10px 12px;
    overflow-y: auto;
  }

  :global(.poster-dialog .el-dialog__footer) {
    padding: 10px 12px 14px;
  }

  .poster-preview-shell {
    width: 280px;
    height: min(560px, calc(100vh - 260px));
  }

  .poster-preview-shell :deep(.report-poster) {
    transform: scale(0.259259);
  }

  .poster-dialog-actions,
  .poster-dialog-button {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .hero-copy h1 {
    font-size: 19px;
  }

  .report-hero {
    padding: 18px;
  }

  .poster-preview-shell {
    width: 250px;
    height: min(500px, calc(100vh - 260px));
  }

  .poster-preview-shell :deep(.report-poster) {
    transform: scale(0.231481);
  }
}
</style>
