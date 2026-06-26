<template>
  <section class="page">
    <div class="history-head">
      <div>
        <p class="eyebrow">History</p>
        <h1 class="section-title">历史记录</h1>
        <p class="section-lead">
          这里保存当前浏览器生成的测算报告。{{ source === 'remote' ? '记录已从后端数据库读取。' : '后端暂不可用，当前展示浏览器本地缓存记录。' }}
        </p>
      </div>

      <el-popconfirm
        v-if="source === 'local' && records.length"
        title="确定清除本地缓存记录吗？"
        confirm-button-text="清除"
        cancel-button-text="取消"
        @confirm="removeAll"
      >
        <template #reference>
          <button class="ghost-button clear-button" type="button">
            <Trash2 class="button-icon" />
            清除本地缓存
          </button>
        </template>
      </el-popconfirm>
    </div>

    <section class="history-filter glass-card">
      <span>当前浏览器匿名历史</span>
      <strong>{{ records.length }}</strong>
      <p>不同设备或清除浏览器缓存后，会生成新的匿名标识。</p>
    </section>

    <div v-if="loading" class="empty glass-panel">
      <HistoryIcon class="empty-icon" />
      <h2>正在读取历史记录</h2>
      <p>正在同步后端报告列表。</p>
    </div>

    <div v-else-if="records.length" class="record-list">
      <article v-for="record in records" :key="record.id" class="record-item glass-card">
        <div class="record-main">
          <div class="record-tags">
            <span class="record-type">{{ record.type }}</span>
            <span :class="['unlock-tag', { active: isUnlocked(record) }]">
              {{ isUnlocked(record) ? '已解锁' : '未解锁' }}
            </span>
          </div>
          <h2>{{ record.summary }}</h2>
          <p>{{ formatDate(record.createdAt) }}</p>
        </div>

        <div class="record-side">
          <strong>{{ record.score }}</strong>
          <RouterLink class="primary-button view-button" :to="{ name: 'result', params: { id: record.id } }">
            <Eye class="button-icon" />
            查看报告
          </RouterLink>
        </div>
      </article>
    </div>

    <div v-else class="empty glass-panel">
      <HistoryIcon class="empty-icon" />
      <h2>暂无测算记录</h2>
      <p>完成一次测算后，你的报告会保存在这里。</p>
      <RouterLink class="primary-button view-button" to="/">
        <Sparkles class="button-icon" />
        去测算
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Eye from '@lucide/vue/dist/esm/icons/eye.mjs'
import HistoryIcon from '@lucide/vue/dist/esm/icons/history.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import Trash2 from '@lucide/vue/dist/esm/icons/trash-2.mjs'
import { fetchReports } from '../utils/aiService'
import { getClientId } from '../utils/clientId'
import { clearReports, getReports, isReportUnlocked, syncReports, unlockReport } from '../utils/storage'

const records = ref([])
const loading = ref(false)
const source = ref('remote')

onMounted(loadRecords)

async function loadRecords() {
  loading.value = true

  try {
    const clientId = getClientId()
    const result = await fetchReports({ page: 1, pageSize: 100, clientId })
    const reportData = result?.data || result
    const remoteRecords = Array.isArray(reportData?.list) ? reportData.list : []
    records.value = remoteRecords.filter((report) => report?.clientId === clientId)
    source.value = 'remote'
    syncReports(records.value, clientId)

    records.value.forEach((report) => {
      if (report.unlocked) {
        unlockReport(report.id)
      }
    })
  } catch {
    records.value = getReports()
    source.value = 'local'
  } finally {
    loading.value = false
  }
}

function removeAll() {
  clearReports()
  records.value = []
}

function isUnlocked(record) {
  return Boolean(record?.unlocked || isReportUnlocked(record?.id))
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
.history-head {
  display: flex;
  gap: 18px;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.history-filter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 18px;
  align-items: center;
  margin-bottom: 18px;
  padding: 18px 20px;
}

.history-filter span {
  color: var(--gold);
  font-weight: 900;
}

.history-filter strong {
  grid-row: span 2;
  color: var(--gold);
  font-size: 34px;
}

.history-filter p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--gold);
  font-weight: 700;
}

.clear-button,
.view-button {
  min-height: 42px;
  padding: 0 18px;
}

.record-list {
  display: grid;
  gap: 14px;
}

.record-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 22px;
  align-items: center;
  padding: 22px;
  overflow: hidden;
  border-color: rgba(245, 203, 115, 0.16);
  animation: history-record-in 0.58s var(--motion-ease) both;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.record-item::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background: linear-gradient(115deg, transparent 0 38%, rgba(255, 236, 188, 0.08) 48%, transparent 58%);
  background-size: 220% 100%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.record-item:nth-child(2) {
  animation-delay: 70ms;
}

.record-item:nth-child(3) {
  animation-delay: 140ms;
}

.record-item:nth-child(4) {
  animation-delay: 210ms;
}

.record-item:hover {
  border-color: rgba(245, 203, 115, 0.34);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.36), 0 0 28px rgba(245, 203, 115, 0.08);
  transform: translateY(-2px);
}

.record-item:hover::after {
  opacity: 1;
  animation: history-card-sheen 1.1s ease;
}

.record-tags {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.record-type,
.unlock-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

.record-type {
  color: #17100b;
  background: var(--gold);
}

.unlock-tag {
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.055);
}

.unlock-tag.active {
  color: var(--teal);
  border-color: rgba(121, 242, 223, 0.34);
  background: rgba(121, 242, 223, 0.08);
}

.record-item h2 {
  margin: 10px 0;
  font-size: 21px;
  line-height: 1.45;
}

.record-item p {
  margin: 0;
  color: var(--muted);
}

.record-side {
  display: grid;
  justify-items: end;
  gap: 12px;
}

.record-side strong {
  color: var(--gold);
  font-size: 34px;
}

.empty {
  display: grid;
  min-height: 420px;
  padding: 34px;
  text-align: center;
  place-items: center;
}

.empty-icon {
  width: 42px;
  height: 42px;
  color: var(--gold);
  animation: empty-icon-float 4.2s ease-in-out infinite;
}

.empty h2 {
  margin: 0;
  font-size: 26px;
}

.empty p {
  max-width: 460px;
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}

@keyframes history-record-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes history-card-sheen {
  from {
    background-position: -120% 0;
  }

  to {
    background-position: 140% 0;
  }
}

@keyframes empty-icon-float {
  0%,
  100% {
    transform: translateY(0);
    filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.16));
  }

  50% {
    transform: translateY(-8px);
    filter: drop-shadow(0 0 22px rgba(245, 203, 115, 0.34));
  }
}

@media (max-width: 720px) {
  .history-head,
  .record-item {
    grid-template-columns: 1fr;
  }

  .history-head {
    align-items: start;
    flex-direction: column;
  }

  .record-side {
    justify-items: start;
  }
}

@media (max-width: 520px) {
  .record-item {
    gap: 16px;
    padding: 18px;
  }

  .history-filter {
    grid-template-columns: 1fr;
  }

  .history-filter strong {
    grid-row: auto;
  }

  .record-item h2 {
    font-size: 18px;
    line-height: 1.52;
  }

  .record-side {
    width: 100%;
  }

  .view-button,
  .clear-button {
    width: 100%;
  }

  .empty {
    min-height: 340px;
    padding: 24px 18px;
  }

  .empty h2 {
    font-size: 22px;
  }
}
</style>
