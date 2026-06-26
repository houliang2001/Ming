<template>
  <section class="page admin-page">
    <div v-if="!authed" class="admin-login glass-panel gold-frame">
      <ShieldCheck class="login-icon" />
      <p class="eyebrow">Admin</p>
      <h1>灵犀阁数据后台</h1>
      <p>请输入管理员口令查看报告、订单、收入和解锁数据。</p>

      <form class="login-form" @submit.prevent="submitToken">
        <input
          v-model="tokenInput"
          class="admin-input"
          type="password"
          autocomplete="off"
          placeholder="ADMIN_TOKEN"
        />
        <button class="primary-button login-button" type="submit" :disabled="loading">
          <LogIn class="button-icon" />
          {{ loading ? '正在验证' : '进入后台' }}
        </button>
      </form>
    </div>

    <template v-else>
      <header class="admin-head">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>灵犀阁数据后台</h1>
          <p>只读查看报告、订单、收入与解锁数据。</p>
        </div>

        <div class="admin-actions">
          <button class="ghost-button small-button" type="button" :disabled="loading" @click="loadAll">
            <RefreshCcw class="button-icon" />
            刷新
          </button>
          <button class="ghost-button small-button" type="button" @click="logout">
            退出
          </button>
        </div>
      </header>

      <section class="stats-grid">
        <article v-for="item in overviewCards" :key="item.label" class="stat-card glass-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <section class="admin-section glass-panel">
        <div class="section-top">
          <div>
            <p class="eyebrow">Reports</p>
            <h2>报告列表</h2>
          </div>
        </div>

        <div class="filter-grid">
          <label>
            测算类型
            <select v-model="reportFilters.type" class="admin-input">
              <option value="">全部</option>
              <option value="手相测算">手相测算</option>
              <option value="面相测算">面相测算</option>
              <option value="生辰八字">生辰八字</option>
              <option value="塔罗牌">塔罗牌</option>
            </select>
          </label>
          <label>
            解锁状态
            <select v-model="reportFilters.unlocked" class="admin-input">
              <option value="">全部</option>
              <option value="true">已解锁</option>
              <option value="false">未解锁</option>
            </select>
          </label>
          <label>
            开始日期
            <input v-model="reportFilters.startDate" class="admin-input" type="date" />
          </label>
          <label>
            结束日期
            <input v-model="reportFilters.endDate" class="admin-input" type="date" />
          </label>
          <label class="keyword-field">
            关键词
            <input v-model="reportFilters.keyword" class="admin-input" placeholder="报告ID / summary" />
          </label>
          <button class="primary-button filter-button" type="button" @click="searchReports">
            查询报告
          </button>
        </div>

        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>报告ID</th>
                <th>匿名标识</th>
                <th>测算类型</th>
                <th>评分</th>
                <th>解锁</th>
                <th>生成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td class="mono-cell">{{ report.id }}</td>
                <td class="mono-cell">{{ formatClientId(report.clientId) }}</td>
                <td>{{ report.type }}</td>
                <td>{{ report.score }}</td>
                <td>
                  <span :class="['status-pill', report.unlocked ? 'paid' : 'pending']">
                    {{ report.unlocked ? '已解锁' : '未解锁' }}
                  </span>
                </td>
                <td>{{ formatDate(report.createdAt) }}</td>
                <td>
                  <button class="ghost-button table-button" type="button" @click="openReportDetail(report.id)">
                    查看详情
                  </button>
                </td>
              </tr>
              <tr v-if="!reports.length">
                <td colspan="7" class="empty-cell">暂无报告数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <button class="ghost-button table-button" type="button" :disabled="reportPage <= 1" @click="changeReportPage(reportPage - 1)">
            上一页
          </button>
          <span>第 {{ reportPage }} 页 / 共 {{ reportTotalPages }} 页</span>
          <button class="ghost-button table-button" type="button" :disabled="reportPage >= reportTotalPages" @click="changeReportPage(reportPage + 1)">
            下一页
          </button>
          <select v-model.number="reportPageSize" class="admin-input page-size" @change="searchReports">
            <option :value="10">10 条</option>
            <option :value="20">20 条</option>
            <option :value="50">50 条</option>
          </select>
        </div>
      </section>

      <section class="admin-section glass-panel">
        <div class="section-top">
          <div>
            <p class="eyebrow">Orders</p>
            <h2>订单列表</h2>
          </div>
        </div>

        <div class="filter-grid order-filters">
          <label>
            支付状态
            <select v-model="orderFilters.payStatus" class="admin-input">
              <option value="">全部</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
              <option value="closed">closed</option>
            </select>
          </label>
          <label>
            开始日期
            <input v-model="orderFilters.startDate" class="admin-input" type="date" />
          </label>
          <label>
            结束日期
            <input v-model="orderFilters.endDate" class="admin-input" type="date" />
          </label>
          <label class="keyword-field">
            关键词
            <input v-model="orderFilters.keyword" class="admin-input" placeholder="订单号 / reportId" />
          </label>
          <button class="primary-button filter-button" type="button" @click="searchOrders">
            查询订单
          </button>
        </div>

        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>reportId</th>
                <th>金额</th>
                <th>支付状态</th>
                <th>渠道</th>
                <th>支付宝交易号</th>
                <th>创建时间</th>
                <th>支付时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="mono-cell">{{ order.orderNo }}</td>
                <td class="mono-cell">{{ order.reportId }}</td>
                <td>{{ formatMoney(order.amount) }}</td>
                <td>
                  <span :class="['status-pill', order.payStatus === 'paid' ? 'paid' : 'pending']">
                    {{ order.payStatus }}
                  </span>
                </td>
                <td>{{ order.payChannel }}</td>
                <td class="mono-cell">{{ order.alipayTradeNo || '-' }}</td>
                <td>{{ formatDate(order.createdAt) }}</td>
                <td>{{ order.paidAt ? formatDate(order.paidAt) : '-' }}</td>
              </tr>
              <tr v-if="!orders.length">
                <td colspan="8" class="empty-cell">暂无订单数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <button class="ghost-button table-button" type="button" :disabled="orderPage <= 1" @click="changeOrderPage(orderPage - 1)">
            上一页
          </button>
          <span>第 {{ orderPage }} 页 / 共 {{ orderTotalPages }} 页</span>
          <button class="ghost-button table-button" type="button" :disabled="orderPage >= orderTotalPages" @click="changeOrderPage(orderPage + 1)">
            下一页
          </button>
          <select v-model.number="orderPageSize" class="admin-input page-size" @change="searchOrders">
            <option :value="10">10 条</option>
            <option :value="20">20 条</option>
            <option :value="50">50 条</option>
          </select>
        </div>
      </section>

      <section class="admin-section glass-panel">
        <div class="section-top">
          <div>
            <p class="eyebrow">Revenue</p>
            <h2>收入统计</h2>
          </div>
        </div>

        <div class="revenue-grid">
          <article v-for="item in revenueCards" :key="item.label" class="stat-card glass-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div class="daily-chart">
          <div v-for="item in dailyRevenue" :key="item.date" class="daily-bar">
            <span>{{ item.date.slice(5) }}</span>
            <i :style="{ height: `${barHeight(item.revenue)}%` }"></i>
            <strong>{{ formatMoney(item.revenue) }}</strong>
          </div>
        </div>

        <h3 class="trend-title">今日灵签趋势</h3>
        <div class="daily-chart fortune-chart">
          <div v-for="item in dailyFortuneTrend" :key="item.date" class="daily-bar">
            <span>{{ item.date.slice(5) }}</span>
            <i :style="{ height: `${fortuneBarHeight(item.count)}%` }"></i>
            <strong>{{ item.count }}</strong>
          </div>
        </div>
      </section>
    </template>

    <el-dialog v-model="detailVisible" title="报告详情" width="min(880px, 94vw)">
      <div v-if="selectedReport" class="report-detail">
        <div class="detail-summary">
          <span>{{ selectedReport.type }}</span>
          <strong>{{ selectedReport.score }}</strong>
          <em>{{ selectedReport.unlocked ? '已解锁' : '未解锁' }}</em>
        </div>

        <h3>核心结论</h3>
        <p>{{ selectedReport.summary }}</p>

        <h3>基础报告</h3>
        <article v-for="section in selectedReport.sections || []" :key="section.title" class="detail-block">
          <strong>{{ section.title }}</strong>
          <p>{{ section.content }}</p>
        </article>

        <h3>完整报告</h3>
        <article v-for="section in selectedReport.detailSections || []" :key="section.title" class="detail-block">
          <strong>{{ section.title }}</strong>
          <p>{{ section.content }}</p>
        </article>

        <h3>输入数据</h3>
        <pre>{{ stringify(selectedReport.inputData) }}</pre>

        <h3>其他信息</h3>
        <pre>{{ stringify(detailMeta) }}</pre>
      </div>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import LogIn from '@lucide/vue/dist/esm/icons/log-in.mjs'
import RefreshCcw from '@lucide/vue/dist/esm/icons/refresh-ccw.mjs'
import ShieldCheck from '@lucide/vue/dist/esm/icons/shield-check.mjs'
import {
  AdminServiceError,
  getAdminOrders,
  getAdminReportDetail,
  getAdminReports,
  getAdminStats,
  getDailyRevenue,
  hasAdminToken,
  loginAdmin,
  logoutAdmin,
} from '../utils/adminService'

const authed = ref(hasAdminToken())
const tokenInput = ref('')
const loading = ref(false)
const stats = ref({})
const reports = ref([])
const orders = ref([])
const dailyRevenue = ref([])
const reportTotal = ref(0)
const reportPage = ref(1)
const reportPageSize = ref(20)
const orderTotal = ref(0)
const orderPage = ref(1)
const orderPageSize = ref(20)
const detailVisible = ref(false)
const selectedReport = ref(null)

const reportFilters = reactive({
  type: '',
  unlocked: '',
  startDate: '',
  endDate: '',
  keyword: '',
})

const orderFilters = reactive({
  payStatus: '',
  startDate: '',
  endDate: '',
  keyword: '',
})

const overviewCards = computed(() => [
  { label: '总报告数', value: stats.value.totalReports ?? 0 },
  { label: '已解锁报告数', value: stats.value.totalUnlocked ?? 0 },
  { label: '未解锁报告数', value: stats.value.totalLocked ?? 0 },
  { label: '总订单数', value: stats.value.totalOrders ?? 0 },
  { label: '已支付订单数', value: stats.value.paidOrders ?? 0 },
  { label: '待支付订单数', value: stats.value.pendingOrders ?? 0 },
  { label: '总收入', value: formatMoney(stats.value.totalRevenue) },
  { label: '今日收入', value: formatMoney(stats.value.todayRevenue) },
  { label: '今日灵签次数', value: stats.value.dailyFortuneToday ?? 0 },
  { label: '灵签总次数', value: stats.value.dailyFortuneTotal ?? 0 },
])

const revenueCards = computed(() => [
  { label: '今日收入', value: formatMoney(stats.value.todayRevenue) },
  { label: '昨日收入', value: formatMoney(stats.value.yesterdayRevenue) },
  { label: '本月收入', value: formatMoney(stats.value.monthRevenue) },
  { label: '总收入', value: formatMoney(stats.value.totalRevenue) },
  { label: '今日支付订单数', value: stats.value.todayPaidOrders ?? 0 },
  { label: '本月支付订单数', value: stats.value.monthPaidOrders ?? 0 },
])

const reportTotalPages = computed(() => Math.max(Math.ceil(reportTotal.value / reportPageSize.value), 1))
const orderTotalPages = computed(() => Math.max(Math.ceil(orderTotal.value / orderPageSize.value), 1))
const maxDailyRevenue = computed(() => Math.max(...dailyRevenue.value.map((item) => Number(item.revenue || 0)), 1))
const dailyFortuneTrend = computed(() => Array.isArray(stats.value.dailyFortuneTrend7d) ? stats.value.dailyFortuneTrend7d : [])
const maxDailyFortuneCount = computed(() => Math.max(...dailyFortuneTrend.value.map((item) => Number(item.count || 0)), 1))
const detailMeta = computed(() => {
  if (!selectedReport.value) return {}

  return {
    id: selectedReport.value.id,
    clientId: formatClientId(selectedReport.value.clientId),
    imageQuality: selectedReport.value.imageQuality,
    unlocked: selectedReport.value.unlocked,
    createdAt: selectedReport.value.createdAt,
    updatedAt: selectedReport.value.updatedAt,
  }
})

onMounted(() => {
  if (authed.value) {
    loadAll()
  }
})

async function submitToken() {
  try {
    loginAdmin(tokenInput.value)
    authed.value = true
    const ok = await loadAll()

    if (ok) {
      ElMessage.success('后台口令验证成功')
    }
  } catch (error) {
    authed.value = false
    ElMessage.error(resolveError(error))
  }
}

async function loadAll() {
  loading.value = true

  try {
    const [statsData, reportsData, ordersData, dailyData] = await Promise.all([
      getAdminStats(),
      getAdminReports({ ...reportFilters, page: reportPage.value, pageSize: reportPageSize.value }),
      getAdminOrders({ ...orderFilters, page: orderPage.value, pageSize: orderPageSize.value }),
      getDailyRevenue(),
    ])

    stats.value = statsData || {}
    reports.value = reportsData?.list || []
    reportTotal.value = reportsData?.total || 0
    orders.value = ordersData?.list || []
    orderTotal.value = ordersData?.total || 0
    dailyRevenue.value = dailyData?.list || []
    return true
  } catch (error) {
    handleAdminError(error)
    return false
  } finally {
    loading.value = false
  }
}

async function searchReports() {
  reportPage.value = 1
  await loadReports()
}

async function searchOrders() {
  orderPage.value = 1
  await loadOrders()
}

async function loadReports() {
  try {
    const result = await getAdminReports({ ...reportFilters, page: reportPage.value, pageSize: reportPageSize.value })
    reports.value = result?.list || []
    reportTotal.value = result?.total || 0
  } catch (error) {
    handleAdminError(error)
  }
}

async function loadOrders() {
  try {
    const result = await getAdminOrders({ ...orderFilters, page: orderPage.value, pageSize: orderPageSize.value })
    orders.value = result?.list || []
    orderTotal.value = result?.total || 0
  } catch (error) {
    handleAdminError(error)
  }
}

async function changeReportPage(page) {
  reportPage.value = page
  await loadReports()
}

async function changeOrderPage(page) {
  orderPage.value = page
  await loadOrders()
}

async function openReportDetail(id) {
  try {
    selectedReport.value = await getAdminReportDetail(id)
    detailVisible.value = true
  } catch (error) {
    handleAdminError(error)
  }
}

function logout() {
  logoutAdmin()
  authed.value = false
  tokenInput.value = ''
}

function handleAdminError(error) {
  if (error instanceof AdminServiceError && error.status === 401) {
    logout()
  }

  ElMessage.error(resolveError(error))
}

function resolveError(error) {
  if (error instanceof AdminServiceError) {
    return error.message
  }

  return '后台数据读取失败，请稍后重试'
}

function formatMoney(value = 0) {
  return `¥${Number(value || 0).toFixed(2)}`
}

function formatDate(date) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatClientId(clientId) {
  if (!clientId) return '-'

  return `${String(clientId).slice(0, 8)}...`
}

function stringify(value) {
  return JSON.stringify(value ?? {}, null, 2)
}

function barHeight(value) {
  const percent = (Number(value || 0) / maxDailyRevenue.value) * 100
  return Math.max(percent, 8)
}

function fortuneBarHeight(value) {
  const percent = (Number(value || 0) / maxDailyFortuneCount.value) * 100
  return Math.max(percent, 8)
}
</script>

<style scoped>
.admin-page {
  padding-top: 28px;
}

.admin-login {
  display: grid;
  width: min(520px, 100%);
  min-height: 420px;
  margin: 36px auto;
  padding: 34px;
  text-align: center;
  place-items: center;
}

.login-icon {
  width: 46px;
  height: 46px;
  color: var(--gold);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--gold);
  font-weight: 800;
}

.admin-login h1,
.admin-head h1 {
  margin: 0;
  font-size: 34px;
}

.admin-login p,
.admin-head p {
  margin: 0;
  color: var(--muted);
}

.login-form {
  display: grid;
  width: 100%;
  gap: 12px;
}

.admin-input {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  color: var(--text);
  border: 1px solid rgba(244, 210, 132, 0.18);
  border-radius: var(--radius-md);
  outline: none;
  background: rgba(255, 255, 255, 0.06);
}

.admin-input:focus {
  border-color: rgba(244, 210, 132, 0.58);
  box-shadow: 0 0 0 3px rgba(244, 210, 132, 0.08);
}

.admin-input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.72;
}

.login-button {
  min-height: 44px;
  font-weight: 800;
}

.admin-head {
  display: flex;
  gap: 18px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
}

.admin-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.small-button,
.table-button,
.filter-button {
  min-height: 38px;
  padding: 0 16px;
  font-weight: 800;
}

.stats-grid,
.revenue-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  position: relative;
  display: grid;
  min-height: 118px;
  padding: 18px;
  overflow: hidden;
  align-content: center;
  gap: 8px;
  animation: admin-card-in 0.56s var(--motion-ease) both;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.stat-card::after {
  position: absolute;
  right: -28px;
  bottom: -28px;
  width: 82px;
  height: 82px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.12);
  border-radius: 50%;
}

.stat-card:nth-child(2) {
  animation-delay: 60ms;
}

.stat-card:nth-child(3) {
  animation-delay: 120ms;
}

.stat-card:nth-child(4) {
  animation-delay: 180ms;
}

.stat-card:hover {
  border-color: rgba(245, 203, 115, 0.32);
  box-shadow: 0 22px 58px rgba(0, 0, 0, 0.28), 0 0 24px rgba(245, 203, 115, 0.07);
  transform: translateY(-2px);
}

.stat-card span {
  color: var(--muted);
  font-size: 13px;
}

.stat-card strong {
  color: var(--gold);
  font-size: 28px;
  line-height: 1.1;
}

.admin-section {
  margin-top: 22px;
  padding: 24px;
}

.section-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-top h2 {
  margin: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr minmax(220px, 1.4fr) auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 16px;
}

.order-filters {
  grid-template-columns: 1fr 1fr 1fr minmax(260px, 1.4fr) auto;
}

.filter-grid label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(244, 210, 132, 0.12);
  border-radius: var(--radius-md);
}

.admin-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-table th {
  color: rgba(244, 210, 132, 0.92);
  font-size: 13px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.045);
}

.admin-table td {
  color: rgba(247, 241, 255, 0.78);
  font-size: 14px;
}

.mono-cell {
  font-family: Consolas, Monaco, monospace;
  font-size: 12px !important;
}

.status-pill {
  display: inline-flex;
  min-height: 26px;
  padding: 0 10px;
  align-items: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.status-pill.paid {
  color: var(--teal);
  border: 1px solid rgba(121, 242, 223, 0.34);
  background: rgba(121, 242, 223, 0.08);
}

.status-pill.pending {
  color: var(--gold);
  border: 1px solid rgba(244, 210, 132, 0.28);
  background: rgba(244, 210, 132, 0.08);
}

.empty-cell {
  height: 96px;
  color: var(--muted) !important;
  text-align: center !important;
}

.pagination-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 14px;
  color: var(--muted);
  flex-wrap: wrap;
}

.page-size {
  width: 96px;
}

.daily-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
  height: 220px;
  margin-top: 20px;
  padding: 18px;
  border: 1px solid rgba(244, 210, 132, 0.12);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.035);
}

.trend-title {
  margin: 22px 0 0;
  color: var(--gold);
}

.fortune-chart .daily-bar i {
  background: linear-gradient(180deg, rgba(244, 210, 132, 0.96), rgba(177, 139, 255, 0.7));
}

.daily-bar {
  display: grid;
  height: 100%;
  gap: 8px;
  align-items: end;
  justify-items: center;
  color: var(--muted);
  font-size: 12px;
}

.daily-bar i {
  display: block;
  width: 100%;
  min-height: 10px;
  max-width: 42px;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, var(--gold), rgba(110, 203, 255, 0.72));
  box-shadow: 0 0 18px rgba(244, 210, 132, 0.2);
  transform-origin: bottom;
  animation: admin-bar-grow 0.72s var(--motion-ease) both;
}

.daily-bar strong {
  color: var(--gold);
  font-size: 12px;
}

@keyframes admin-card-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes admin-bar-grow {
  from {
    transform: scaleY(0.28);
  }

  to {
    transform: scaleY(1);
  }
}

.report-detail {
  display: grid;
  gap: 16px;
}

.detail-summary {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.detail-summary span,
.detail-summary em {
  padding: 8px 10px;
  font-style: normal;
  border: 1px solid rgba(244, 210, 132, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.detail-summary strong {
  display: grid;
  width: 48px;
  height: 48px;
  color: #17100b;
  border-radius: 50%;
  background: var(--gold);
  place-items: center;
}

.report-detail h3 {
  margin: 6px 0 0;
  color: var(--gold);
}

.report-detail p {
  margin: 0;
  color: rgba(247, 241, 255, 0.74);
  line-height: 1.8;
}

.detail-block {
  padding: 14px;
  border: 1px solid rgba(244, 210, 132, 0.12);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.045);
}

.detail-block strong {
  display: block;
  margin-bottom: 8px;
  color: var(--text);
}

pre {
  max-height: 260px;
  padding: 14px;
  overflow: auto;
  color: rgba(247, 241, 255, 0.74);
  border: 1px solid rgba(244, 210, 132, 0.12);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.24);
}

@media (max-width: 1180px) {
  .stats-grid,
  .revenue-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-grid,
  .order-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .admin-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-login {
    min-height: 360px;
    padding: 26px 18px;
  }

  .admin-login h1,
  .admin-head h1 {
    font-size: 26px;
    line-height: 1.3;
  }

  .admin-actions,
  .login-button,
  .filter-button,
  .small-button {
    width: 100%;
  }

  .stats-grid,
  .revenue-grid,
  .filter-grid,
  .order-filters,
  .daily-chart {
    grid-template-columns: 1fr;
  }

  .daily-chart {
    height: auto;
  }

  .admin-section {
    padding: 18px;
  }

  .table-wrap {
    margin-inline: -2px;
  }

  .daily-bar {
    grid-template-columns: 56px 1fr 74px;
    height: 36px;
    align-items: center;
  }

  .daily-bar i {
    width: 100% !important;
    max-width: none;
    height: 10px !important;
    border-radius: 999px;
  }
}

@media (max-width: 380px) {
  .stat-card strong {
    font-size: 24px;
  }
}
</style>
