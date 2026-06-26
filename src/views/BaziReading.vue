<template>
  <section class="page bazi-page">
    <div class="bazi-layout">
      <div class="bazi-control glass-panel">
        <div class="bazi-title-block">
          <p class="eyebrow ornate">BaZi Reading</p>
          <h1 class="section-title">生辰八字</h1>
          <p class="section-lead">输入出生信息，由 AI 生成娱乐化八字文化体验报告。</p>
        </div>

        <div class="bazi-step-line" aria-label="八字测算流程">
          <span v-for="(step, index) in steps" :key="step" :class="{ active: currentStep >= index + 1 }">
            <b>{{ index + 1 }}</b>
            {{ step }}
          </span>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="bazi-form">
          <el-form-item label="姓名（非必填）">
            <el-input v-model="form.name" placeholder="可留空" />
          </el-form-item>

          <div class="form-row two-cols">
            <el-form-item label="性别">
              <el-select v-model="form.gender" placeholder="请选择">
                <el-option label="女" value="女" />
                <el-option label="男" value="男" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>

            <el-form-item label="想测方向" prop="questionType">
              <el-select v-model="form.questionType" placeholder="请选择">
                <el-option v-for="item in directions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-row two-cols">
            <el-form-item label="出生日期" prop="birthDate">
              <input
                v-model="form.birthDate"
                class="native-field"
                type="date"
                aria-label="出生日期"
              />
            </el-form-item>

            <el-form-item label="出生时间" prop="birthTime">
              <input
                v-model="form.birthTime"
                class="native-field"
                type="time"
                aria-label="出生时间"
              />
            </el-form-item>
          </div>

          <el-form-item label="出生地点（可为空）">
            <el-input v-model="form.birthPlace" placeholder="例如：上海市；留空时分析会更基础" />
            <p class="field-tip">出生地点可为空，填写后有助于生成更完整的文化体验解读。</p>
          </el-form-item>

          <div class="form-block">
            <label class="bazi-field-label">
              <Sparkles class="label-icon" />
              报告风格
            </label>
            <div class="style-card-grid">
              <button
                v-for="style in reportStyleCards"
                :key="style.value"
                :class="['style-card', { active: form.reportStyle === style.value }]"
                type="button"
                @click="form.reportStyle = style.value"
              >
                <component :is="style.icon" class="style-icon" />
                <strong>{{ style.value }}</strong>
                <small>{{ style.hint }}</small>
              </button>
            </div>
          </div>

          <button
            class="primary-button analyze-button"
            type="button"
            :disabled="loading"
            @click="submit"
          >
            <Compass class="button-icon" />
            {{ loading ? '正在生成命理解读……' : '生成八字报告' }}
          </button>

          <p class="form-disclaimer">
            报告内容由 AI 生成，仅供娱乐、文化体验与自我探索参考。
          </p>
        </el-form>
      </div>

      <aside :class="['bazi-stage', 'bazi-chart-panel', 'glass-panel', `state-${chartState}`]">
        <header class="stage-title">
          <div>
            <p class="eyebrow">Destiny Chart</p>
            <h2>命盘预览</h2>
            <p>命盘预览会根据你的出生信息生成阶段化解读，帮助你从另一个角度理解当下状态。</p>
          </div>
          <span :class="['input-state', 'chart-status-pill', { active: hasBirthInfo || chartState === 'calculating' || chartState === 'complete' }]">
            {{ chartStateLabel }}
          </span>
        </header>

        <div :class="['chart-orbit', 'destiny-chart-stage', { active: hasBirthInfo, ready: hasFullBirthInfo }]" aria-label="八字命盘预览">
          <div class="chart-orbit-layer chart-orbit-outer"></div>
          <div class="chart-orbit-layer chart-orbit-middle"></div>
          <div class="chart-orbit-layer chart-orbit-inner"></div>
          <div class="chart-radar-sweep" aria-hidden="true"></div>
          <div class="chart-energy-particles" aria-hidden="true">
            <span v-for="index in 12" :key="index"></span>
          </div>
          <div class="orbit-grid" aria-hidden="true"></div>
          <div class="stem-branch-ring heavenly-ring" aria-hidden="true">
            <span
              v-for="(stem, index) in heavenlyStems"
              :key="stem"
              class="stem-marker"
              :style="getRingPointStyle(index, heavenlyStems.length, 35.5)"
            >
              {{ stem }}
            </span>
          </div>
          <div class="inner-stems earthly-ring" aria-hidden="true">
            <span
              v-for="(branch, index) in earthlyBranches"
              :key="branch"
              :style="getRingPointStyle(index, earthlyBranches.length, 21.5)"
            >
              {{ branch }}
            </span>
          </div>
          <div class="chart-core">
            <strong>命盘</strong>
            <small>{{ chartCoreText }}</small>
          </div>
        </div>

        <div class="pillar-grid">
          <article v-for="pillar in pillars" :key="pillar.title">
            <span>{{ pillar.title }}</span>
            <strong>{{ pillar.value }}</strong>
            <small>{{ hasFullBirthInfo ? '提交后由 AI 生成' : '--' }}</small>
          </article>
        </div>

        <section class="element-panel">
          <div class="element-head">
            <h3>五行能量<span v-if="chartState !== 'complete'">（示例）</span></h3>
            <span>提交报告后生成文化体验解读</span>
          </div>
          <div class="element-list">
            <div v-for="item in fiveElements" :key="item.name" :class="['element-row', `element-${item.key}`]">
              <i :style="{ color: item.color, backgroundColor: item.bg }">{{ item.symbol }}</i>
              <span>{{ item.name }}</span>
              <div class="element-track">
                <b :style="{ width: `${item.value}%`, background: item.gradient, boxShadow: item.shadow }"></b>
              </div>
              <em>{{ item.value }}%</em>
            </div>
          </div>
        </section>

        <div class="chart-status-text">
          <strong>{{ chartStatusText }}</strong>
          <p>{{ chartSubText }}</p>
        </div>

        <div class="stage-meta">
          <span v-for="item in stageMeta" :key="item.text">
            <component :is="item.icon" class="meta-icon" />
            {{ item.text }}
          </span>
        </div>
      </aside>
    </div>

    <LoadingAnalyze
      :active="loading"
      title="正在生成八字报告"
      :messages="[
        '正在整理出生信息……',
        '正在生成命盘结构……',
        '正在分析五行倾向……',
        '正在输出阶段建议……',
      ]"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import ChartNoAxesCombined from '@lucide/vue/dist/esm/icons/chart-no-axes-combined.mjs'
import Compass from '@lucide/vue/dist/esm/icons/compass.mjs'
import HeartHandshake from '@lucide/vue/dist/esm/icons/heart-handshake.mjs'
import Orbit from '@lucide/vue/dist/esm/icons/orbit.mjs'
import ScrollText from '@lucide/vue/dist/esm/icons/scroll-text.mjs'
import ShieldCheck from '@lucide/vue/dist/esm/icons/shield-check.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import Target from '@lucide/vue/dist/esm/icons/target.mjs'
import TrendingUp from '@lucide/vue/dist/esm/icons/trending-up.mjs'
import LoadingAnalyze from '../components/LoadingAnalyze.vue'
import { generateBaziAIReport } from '../utils/aiService'
import { saveReport } from '../utils/storage'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const chartState = ref('idle')
const chartStatusText = ref('等待输入出生信息')
const chartSubText = ref('填写出生日期与时间后，AI 将为你生成专属命盘解读')

const directions = ['综合', '事业', '感情', '财运', '学业', '健康']
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const steps = ['填写信息', '生成命盘', '五行分析', '输出建议']
const baziLoadingSteps = [
  '正在解析出生信息……',
  '正在构建命盘结构……',
  '正在分析五行能量……',
  '正在生成阶段建议……',
]
const pillars = [
  { title: '年柱', value: '待定' },
  { title: '月柱', value: '待定' },
  { title: '日柱', value: '待定' },
  { title: '时柱', value: '待定' },
]

const reportStyleCards = [
  {
    value: '温和指引',
    hint: '以温柔语气给出阶段提醒。',
    icon: HeartHandshake,
  },
  {
    value: '专业命理',
    hint: '偏结构化分析，强调五行与节奏。',
    icon: Orbit,
  },
  {
    value: '行动建议',
    hint: '聚焦下一步具体选择。',
    icon: Target,
  },
]

const fiveElements = ref([
  {
    key: 'wood',
    name: '木',
    symbol: '木',
    value: 60,
    color: '#d9f4a4',
    bg: 'rgba(154, 218, 91, 0.14)',
    gradient: 'linear-gradient(90deg, #9ada5b, #d7ee8e)',
    shadow: '0 0 18px rgba(154, 218, 91, 0.32)',
  },
  {
    key: 'fire',
    name: '火',
    symbol: '火',
    value: 40,
    color: '#ff9b7d',
    bg: 'rgba(255, 141, 103, 0.14)',
    gradient: 'linear-gradient(90deg, #ff8d67, #ffc08e)',
    shadow: '0 0 18px rgba(255, 141, 103, 0.28)',
  },
  {
    key: 'earth',
    name: '土',
    symbol: '土',
    value: 50,
    color: '#ffe08a',
    bg: 'rgba(245, 203, 115, 0.14)',
    gradient: 'linear-gradient(90deg, #f5cb73, #ffe28f)',
    shadow: '0 0 18px rgba(245, 203, 115, 0.32)',
  },
  {
    key: 'metal',
    name: '金',
    symbol: '金',
    value: 70,
    color: '#ffe6a6',
    bg: 'rgba(255, 230, 166, 0.14)',
    gradient: 'linear-gradient(90deg, #d7ad57, #fff0b6)',
    shadow: '0 0 18px rgba(255, 230, 166, 0.32)',
  },
  {
    key: 'water',
    name: '水',
    symbol: '水',
    value: 65,
    color: '#9dd8ff',
    bg: 'rgba(124, 199, 255, 0.14)',
    gradient: 'linear-gradient(90deg, #7cc7ff, #b18bff)',
    shadow: '0 0 18px rgba(124, 199, 255, 0.3)',
  },
])

const stageMeta = [
  { text: '五行平衡分析', icon: Sparkles },
  { text: '性格倾向解读', icon: ScrollText },
  { text: '事业财运趋势', icon: ChartNoAxesCombined },
  { text: '阶段发展建议', icon: ShieldCheck },
]

const form = reactive({
  name: '',
  gender: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  questionType: '综合',
  reportStyle: '温和指引',
})

const rules = {
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  birthTime: [{ required: true, message: '请选择出生时间', trigger: 'change' }],
  questionType: [{ required: true, message: '请选择想测方向', trigger: 'change' }],
}

const hasBirthInfo = computed(() => Boolean(form.birthDate || form.birthTime || form.birthPlace))
const hasFullBirthInfo = computed(() => Boolean(form.birthDate && form.birthTime))
const hasChartInput = computed(() => Boolean(form.birthDate || form.birthTime))
const chartStateLabel = computed(() => {
  const labels = {
    idle: '等待输入',
    ready: '信息已录入',
    calculating: 'AI 计算中',
    complete: '命盘已生成',
    error: '生成失败',
  }
  return labels[chartState.value] || '等待输入'
})
const chartCoreText = computed(() => {
  const labels = {
    idle: '等待生成',
    ready: '准备生成',
    calculating: '推演中',
    complete: '八字命盘',
    error: '待重试',
  }
  return labels[chartState.value] || '等待生成'
})
const currentStep = computed(() => {
  if (loading.value) return 4
  if (hasFullBirthInfo.value) return 3
  if (hasBirthInfo.value) return 2
  return 1
})

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function getRingPointStyle(index, total, radiusPercent) {
  const angle = -90 + (360 / total) * index
  const radian = (angle * Math.PI) / 180
  const x = 50 + Math.cos(radian) * radiusPercent
  const y = 50 + Math.sin(radian) * radiusPercent

  return {
    left: `${x}%`,
    top: `${y}%`,
  }
}

let loadingTimer = null
let loadingStepIndex = 0

function syncChartIdleState() {
  if (chartState.value === 'calculating' || chartState.value === 'complete') return

  if (hasChartInput.value) {
    chartState.value = 'ready'
    chartStatusText.value = '出生信息已录入'
    chartSubText.value = '点击生成八字报告后，AI 将开始构建命盘结构'
    return
  }

  chartState.value = 'idle'
  chartStatusText.value = '等待输入出生信息'
  chartSubText.value = '填写出生日期与时间后，AI 将为你生成专属命盘解读'
}

function startBaziLoadingTextLoop() {
  stopBaziLoadingTextLoop()
  loadingStepIndex = 0
  chartStatusText.value = baziLoadingSteps[0]
  chartSubText.value = 'AI 正在根据出生信息推演阶段化命盘结构'

  loadingTimer = window.setInterval(() => {
    loadingStepIndex = (loadingStepIndex + 1) % baziLoadingSteps.length
    chartStatusText.value = baziLoadingSteps[loadingStepIndex]
  }, 1200)
}

function stopBaziLoadingTextLoop() {
  if (loadingTimer) {
    window.clearInterval(loadingTimer)
    loadingTimer = null
  }
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || loading.value) return

  loading.value = true
  chartState.value = 'calculating'
  startBaziLoadingTextLoop()
  const startedAt = Date.now()

  try {
    const report = await generateBaziAIReport({ ...form })
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    stopBaziLoadingTextLoop()
    chartState.value = 'complete'
    chartStatusText.value = '命盘生成完成'
    chartSubText.value = '正在进入专属报告解读'
    saveReport(report)
    router.push({ name: 'result', params: { id: report.id } })
  } catch {
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    chartState.value = 'error'
    chartStatusText.value = '生成失败'
    chartSubText.value = '请稍后重试，或检查出生信息是否完整'
    ElMessage.error('八字报告生成失败，请稍后重试。')
  } finally {
    stopBaziLoadingTextLoop()
    loading.value = false
  }
}

watch([() => form.birthDate, () => form.birthTime], syncChartIdleState)

onBeforeUnmount(() => {
  stopBaziLoadingTextLoop()
})
</script>

<style scoped>
.bazi-page {
  width: min(1440px, calc(100% - 56px));
  padding-top: 28px;
}

.bazi-layout {
  display: grid;
  grid-template-columns: minmax(420px, 0.92fr) minmax(420px, 0.9fr);
  gap: 28px;
  align-items: stretch;
}

.bazi-control,
.bazi-stage {
  position: relative;
  overflow: hidden;
  border-color: rgba(245, 203, 115, 0.22);
  background:
    radial-gradient(circle at 12% 10%, rgba(245, 203, 115, 0.1), transparent 28%),
    radial-gradient(circle at 82% 6%, rgba(177, 139, 255, 0.12), transparent 32%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)),
    rgba(16, 11, 30, 0.86);
}

.bazi-control {
  padding: 30px;
}

.bazi-control::after,
.bazi-stage::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.44) 0 1px, transparent 1px),
    radial-gradient(circle, rgba(245, 203, 115, 0.34) 0 1px, transparent 1px);
  background-position:
    10px 20px,
    64px 78px;
  background-size:
    130px 130px,
    190px 190px;
  opacity: 0.12;
  animation: bazi-star-drift 32s linear infinite;
}

.bazi-control > *,
.bazi-stage > * {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--gold);
  font-weight: 900;
}

.ornate {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-family: var(--font-tech);
  font-size: 17px;
}

.ornate::before,
.ornate::after {
  width: 34px;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.72));
}

.ornate::after {
  background: linear-gradient(90deg, rgba(245, 203, 115, 0.72), transparent);
}

.bazi-title-block .section-title {
  margin-bottom: 14px;
  color: #fff2c8;
  font-family: var(--font-serif);
  font-size: clamp(42px, 4.2vw, 64px);
  font-weight: 900;
  text-shadow: 0 0 24px rgba(245, 203, 115, 0.22);
}

.bazi-step-line {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 30px 0 0;
}

.bazi-step-line span {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 52px;
  padding: 10px 13px;
  color: rgba(247, 241, 255, 0.62);
  font-weight: 800;
  border: 1px solid rgba(245, 203, 115, 0.15);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(255, 255, 255, 0.035);
}

.bazi-step-line b {
  display: grid;
  width: 28px;
  height: 28px;
  color: rgba(247, 241, 255, 0.78);
  font-size: 14px;
  border: 1px solid rgba(245, 203, 115, 0.32);
  border-radius: 50%;
  background: rgba(14, 10, 24, 0.92);
  place-items: center;
  flex: 0 0 auto;
}

.bazi-step-line span.active {
  color: #fff2c8;
  border-color: rgba(245, 203, 115, 0.42);
  background:
    radial-gradient(circle at 15% 0%, rgba(245, 203, 115, 0.18), transparent 64%),
    rgba(255, 255, 255, 0.055);
}

.bazi-step-line span.active b {
  color: #17100b;
  border-color: rgba(245, 203, 115, 0.82);
  background: linear-gradient(135deg, #fff2b8, #f5cb73 56%, #b98b3e);
  box-shadow: 0 0 18px rgba(245, 203, 115, 0.28);
}

.bazi-form {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}

.bazi-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.bazi-form :deep(.el-form-item__label) {
  margin-bottom: 9px;
  color: rgba(247, 241, 255, 0.88);
  font-weight: 900;
}

.bazi-form :deep(.el-form-item.is-required .el-form-item__label::before) {
  color: var(--gold);
}

.bazi-form :deep(.el-input__wrapper),
.bazi-form :deep(.el-select__wrapper) {
  min-height: 44px;
  padding: 0 14px;
  border-color: rgba(245, 203, 115, 0.22);
  border-radius: 14px;
  background:
    radial-gradient(circle at 80% 0%, rgba(177, 139, 255, 0.08), transparent 42%),
    rgba(255, 255, 255, 0.055);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.16);
}

.bazi-form :deep(.el-input__wrapper.is-focus),
.bazi-form :deep(.el-select__wrapper.is-focused),
.native-field:focus {
  border-color: rgba(245, 203, 115, 0.72);
  box-shadow:
    0 0 0 3px rgba(245, 203, 115, 0.09),
    inset 0 0 20px rgba(0, 0, 0, 0.16);
}

.bazi-form :deep(.el-input__inner::placeholder) {
  color: rgba(247, 241, 255, 0.42);
}

.form-row {
  display: grid;
  gap: 18px;
}

.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.native-field {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  color: var(--text);
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: 14px;
  outline: none;
  background:
    radial-gradient(circle at 80% 0%, rgba(177, 139, 255, 0.08), transparent 42%),
    rgba(255, 255, 255, 0.055);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.16);
}

.native-field::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.72;
}

.field-tip {
  margin: 9px 0 0;
  color: rgba(247, 241, 255, 0.52);
  font-size: 13px;
  line-height: 1.6;
}

.form-block {
  display: grid;
  gap: 12px;
}

.bazi-field-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: rgba(247, 241, 255, 0.86);
  font-weight: 900;
}

.label-icon,
.style-icon,
.meta-icon {
  color: var(--gold);
  filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.32));
}

.label-icon {
  width: 18px;
  height: 18px;
}

.style-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.style-card {
  display: grid;
  min-height: 128px;
  padding: 18px;
  gap: 8px;
  color: rgba(247, 241, 255, 0.78);
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(255, 255, 255, 0.035);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.style-card:hover,
.style-card.active {
  color: #fff2c8;
  border-color: rgba(245, 203, 115, 0.76);
  background:
    radial-gradient(circle at 0% 0%, rgba(245, 203, 115, 0.18), transparent 68%),
    rgba(245, 203, 115, 0.075);
  box-shadow: 0 0 24px rgba(245, 203, 115, 0.14), inset 0 0 22px rgba(245, 203, 115, 0.05);
  transform: translateY(-2px);
}

.style-icon {
  width: 25px;
  height: 25px;
}

.style-card strong {
  color: var(--gold-light);
  font-size: 18px;
}

.style-card small {
  color: rgba(247, 241, 255, 0.58);
  line-height: 1.65;
}

.analyze-button {
  min-height: 54px;
  width: 100%;
  margin-top: 4px;
  padding: 0 24px;
  font-size: 17px;
  font-weight: 900;
}

.analyze-button:hover {
  box-shadow:
    0 14px 38px rgba(245, 203, 115, 0.3),
    0 0 28px rgba(245, 203, 115, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
}

.analyze-button:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
}

.form-disclaimer {
  margin: -2px 0 0;
  color: rgba(247, 241, 255, 0.56);
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
}

.bazi-stage {
  display: grid;
  padding: 30px;
  align-content: start;
}

.stage-title {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.stage-title h2 {
  margin: 0 0 10px;
  color: #fff2c8;
  font-family: var(--font-serif);
  font-size: 29px;
  text-shadow: 0 0 22px rgba(245, 203, 115, 0.2);
}

.stage-title p:last-child {
  max-width: 540px;
  margin: 0;
  color: rgba(247, 241, 255, 0.66);
  line-height: 1.75;
}

.input-state {
  display: inline-flex;
  min-height: 34px;
  padding: 0 12px;
  align-items: center;
  color: rgba(247, 241, 255, 0.58);
  white-space: nowrap;
  border: 1px solid rgba(245, 203, 115, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.045);
}

.input-state.active {
  color: #17100b;
  border-color: rgba(245, 203, 115, 0.72);
  background: linear-gradient(135deg, #fff2b8, #f5cb73 56%, #b98b3e);
}

.state-ready .input-state {
  color: #fff2c8;
  border-color: rgba(245, 203, 115, 0.42);
  background: rgba(245, 203, 115, 0.08);
}

.state-calculating .input-state,
.state-complete .input-state {
  color: #17100b;
  border-color: rgba(245, 203, 115, 0.8);
  background: linear-gradient(135deg, #fff2b8, #f5cb73 56%, #b98b3e);
  box-shadow: 0 0 24px rgba(245, 203, 115, 0.2);
}

.state-error .input-state {
  color: #fff2c8;
  border-color: rgba(245, 203, 115, 0.34);
  background: rgba(245, 203, 115, 0.06);
}

.chart-orbit {
  position: relative;
  width: min(420px, 76vw);
  height: min(420px, 76vw);
  margin: 34px auto 24px;
  border: 1px solid rgba(245, 203, 115, 0.34);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(245, 203, 115, 0.11), transparent 34%),
    radial-gradient(circle at 50% 50%, rgba(177, 139, 255, 0.12), transparent 58%),
    conic-gradient(from 12deg, rgba(245, 203, 115, 0.18), rgba(255, 255, 255, 0.02), rgba(245, 203, 115, 0.18));
  box-shadow:
    inset 0 0 64px rgba(245, 203, 115, 0.045),
    0 0 52px rgba(245, 203, 115, 0.07);
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  isolation: isolate;
  overflow: visible;
}

.chart-orbit.active {
  border-color: rgba(245, 203, 115, 0.58);
  box-shadow:
    inset 0 0 70px rgba(245, 203, 115, 0.065),
    0 0 66px rgba(245, 203, 115, 0.13),
    0 0 28px rgba(177, 139, 255, 0.14);
}

.state-idle .chart-orbit {
  opacity: 0.82;
}

.state-ready .chart-orbit {
  border-color: rgba(245, 203, 115, 0.48);
  box-shadow:
    inset 0 0 72px rgba(245, 203, 115, 0.055),
    0 0 62px rgba(245, 203, 115, 0.1);
}

.state-calculating .chart-orbit {
  border-color: rgba(245, 203, 115, 0.76);
  box-shadow:
    inset 0 0 82px rgba(245, 203, 115, 0.085),
    0 0 82px rgba(245, 203, 115, 0.18),
    0 0 36px rgba(125, 205, 255, 0.13);
}

.state-complete .chart-orbit {
  animation: completeFlash 0.9s ease-out 1;
}

.state-error .chart-orbit {
  border-color: rgba(245, 203, 115, 0.36);
  box-shadow:
    inset 0 0 58px rgba(245, 203, 115, 0.035),
    0 0 36px rgba(245, 203, 115, 0.07);
}

.chart-orbit.ready .chart-core {
  box-shadow:
    0 0 54px rgba(245, 203, 115, 0.18),
    inset 0 0 46px rgba(245, 203, 115, 0.08);
}

.chart-orbit-layer {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  border: 1px solid rgba(245, 203, 115, 0.16);
}

.chart-orbit-outer {
  inset: 0;
  border-color: rgba(245, 203, 115, 0.26);
  box-shadow: inset 0 0 26px rgba(245, 203, 115, 0.025);
  animation: orbitRotate 34s linear infinite;
}

.chart-orbit-middle {
  inset: 42px;
  border-color: rgba(255, 255, 255, 0.1);
  border-style: dashed;
  animation: orbitReverse 44s linear infinite;
}

.chart-orbit-inner {
  inset: 92px;
  border-color: rgba(245, 203, 115, 0.14);
  box-shadow: inset 0 0 30px rgba(245, 203, 115, 0.035);
  animation: innerOrbitPulse 5.2s ease-in-out infinite;
}

.state-calculating .chart-orbit-outer {
  animation-duration: 18s;
  border-color: rgba(245, 203, 115, 0.38);
}

.state-calculating .chart-orbit-middle {
  animation-duration: 24s;
  border-color: rgba(125, 205, 255, 0.18);
}

.state-calculating .chart-orbit-inner {
  animation-duration: 3.4s;
  border-color: rgba(245, 203, 115, 0.28);
}

.chart-radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 2px;
  height: 47%;
  pointer-events: none;
  background: linear-gradient(to top, rgba(245, 203, 115, 0.72), rgba(245, 203, 115, 0.18), transparent);
  filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.42));
  opacity: 0.4;
  transform: translate(-50%, -100%) rotate(0deg);
  transform-origin: 50% 100%;
  animation: radarSweep 14s linear infinite;
}

.chart-radar-sweep::after {
  position: absolute;
  right: -64px;
  bottom: 0;
  width: 128px;
  height: 128px;
  pointer-events: none;
  content: "";
  background: conic-gradient(from 270deg, rgba(245, 203, 115, 0.16), transparent 42%);
  filter: blur(6px);
  transform: translateY(50%);
}

.state-idle .chart-radar-sweep {
  opacity: 0.24;
  animation-duration: 18s;
}

.state-ready .chart-radar-sweep {
  opacity: 0.5;
  animation-duration: 12s;
}

.state-calculating .chart-radar-sweep {
  opacity: 0.9;
  animation-duration: 5s;
}

.state-complete .chart-radar-sweep {
  opacity: 0.58;
  animation-duration: 14s;
}

.state-error .chart-radar-sweep {
  opacity: 0.18;
  animation-duration: 20s;
}

.chart-energy-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
}

.chart-energy-particles span {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(245, 203, 115, 0.65);
  box-shadow:
    0 0 10px rgba(245, 203, 115, 0.36),
    0 0 18px rgba(177, 139, 255, 0.16);
  opacity: 0.36;
  animation: particleFloat 7.2s ease-in-out infinite;
}

.chart-energy-particles span:nth-child(1) { top: 10%; left: 49%; }
.chart-energy-particles span:nth-child(2) { top: 17%; left: 70%; animation-delay: -1.2s; }
.chart-energy-particles span:nth-child(3) { top: 30%; right: 12%; width: 3px; height: 3px; animation-delay: -2.1s; }
.chart-energy-particles span:nth-child(4) { top: 50%; right: 8%; background: rgba(125, 205, 255, 0.58); animation-delay: -3s; }
.chart-energy-particles span:nth-child(5) { right: 17%; bottom: 24%; animation-delay: -4.2s; }
.chart-energy-particles span:nth-child(6) { right: 35%; bottom: 11%; width: 3px; height: 3px; animation-delay: -5.1s; }
.chart-energy-particles span:nth-child(7) { bottom: 10%; left: 44%; background: rgba(177, 139, 255, 0.6); animation-delay: -2.8s; }
.chart-energy-particles span:nth-child(8) { bottom: 21%; left: 20%; animation-delay: -4.8s; }
.chart-energy-particles span:nth-child(9) { top: 50%; left: 8%; width: 3px; height: 3px; animation-delay: -3.5s; }
.chart-energy-particles span:nth-child(10) { top: 29%; left: 13%; background: rgba(125, 205, 255, 0.52); animation-delay: -1.7s; }
.chart-energy-particles span:nth-child(11) { top: 16%; left: 29%; animation-delay: -6s; }
.chart-energy-particles span:nth-child(12) { top: 40%; left: 38%; width: 2px; height: 2px; animation-delay: -0.8s; }

.state-calculating .chart-energy-particles span {
  opacity: 0.68;
  animation-duration: 4.4s;
}

.state-idle .chart-energy-particles span {
  opacity: 0.22;
}

.state-ready .chart-energy-particles span {
  opacity: 0.48;
}

.state-error .chart-energy-particles span {
  opacity: 0.18;
}

.chart-orbit::before,
.chart-orbit::after,
.orbit-grid::before,
.orbit-grid::after {
  position: absolute;
  content: "";
  border-radius: 50%;
}

.chart-orbit::before {
  inset: 34px;
  border: 1px solid rgba(245, 203, 115, 0.18);
  animation: bazi-orbit-spin 34s linear infinite;
}

.chart-orbit::after {
  inset: 76px;
  border: 1px solid rgba(245, 203, 115, 0.22);
  animation: bazi-orbit-spin 26s linear infinite reverse;
}

.orbit-grid {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.orbit-grid::before {
  inset: 112px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.orbit-grid::after {
  inset: 0;
  background:
    linear-gradient(90deg, transparent 49.8%, rgba(245, 203, 115, 0.18) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 49.8%, rgba(245, 203, 115, 0.18) 50%, transparent 50.2%);
  opacity: 0.6;
  animation: bazi-grid-pulse 5.2s ease-in-out infinite;
}

.stem-marker,
.inner-stems span {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 34px;
  height: 34px;
  margin: 0;
  text-align: center;
  color: rgba(255, 236, 186, 0.92);
  font-family: var(--font-serif);
  font-size: 25px;
  line-height: 1;
  text-shadow: 0 0 16px rgba(245, 203, 115, 0.28);
  place-items: center;
  transform: translate(-50%, -50%);
  animation: markerGlow 5.4s ease-in-out infinite;
  transform-origin: center;
}

.inner-stems span {
  width: 26px;
  height: 26px;
  margin: 0;
  color: rgba(247, 241, 255, 0.46);
  font-size: 15px;
  transform: translate(-50%, -50%);
}

.chart-core {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 142px;
  height: 142px;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.7);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 26%, rgba(245, 203, 115, 0.18), transparent 42%),
    rgba(12, 8, 22, 0.94);
  box-shadow:
    0 0 42px rgba(245, 203, 115, 0.1),
    inset 0 0 38px rgba(245, 203, 115, 0.06);
  place-items: center;
  transform: translate(-50%, -50%);
  animation: corePulse 4.2s ease-in-out infinite;
}

.chart-core strong {
  color: var(--gold);
  font-family: var(--font-serif);
  font-size: 34px;
  line-height: 1;
  text-shadow: 0 0 18px rgba(245, 203, 115, 0.28);
}

.chart-core small {
  margin-top: -30px;
  color: rgba(247, 241, 255, 0.68);
}

.state-calculating .chart-core {
  border-color: rgba(245, 203, 115, 0.86);
  animation-duration: 2.8s;
  box-shadow:
    0 0 62px rgba(245, 203, 115, 0.25),
    0 0 24px rgba(125, 205, 255, 0.1),
    inset 0 0 50px rgba(245, 203, 115, 0.12);
}

.state-complete .chart-core {
  animation:
    completeFlash 0.9s ease-out 1,
    corePulse 4s ease-in-out infinite;
}

.state-error .chart-core {
  border-color: rgba(245, 203, 115, 0.38);
  box-shadow:
    0 0 32px rgba(245, 203, 115, 0.08),
    inset 0 0 28px rgba(245, 203, 115, 0.04);
}

.pillar-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 22px;
}

.pillar-grid article {
  display: grid;
  min-height: 94px;
  padding: 14px 10px;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  align-content: center;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.pillar-grid article:hover {
  border-color: rgba(245, 203, 115, 0.38);
  box-shadow: 0 0 26px rgba(245, 203, 115, 0.08);
  transform: translateY(-2px);
}

.pillar-grid span {
  color: rgba(247, 241, 255, 0.62);
  font-size: 14px;
}

.pillar-grid strong {
  margin-top: 7px;
  color: var(--gold);
  font-size: 18px;
}

.pillar-grid small {
  margin-top: 4px;
  color: rgba(247, 241, 255, 0.42);
}

.element-panel {
  margin-top: 2px;
}

.element-head {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.element-head h3 {
  margin: 0;
  color: #fff2c8;
  font-size: 18px;
}

.element-head span {
  color: rgba(247, 241, 255, 0.48);
  font-size: 13px;
}

.element-list {
  display: grid;
  gap: 12px;
}

.element-row {
  display: grid;
  grid-template-columns: 32px 34px minmax(0, 1fr) 48px;
  gap: 12px;
  align-items: center;
}

.element-row i {
  display: grid;
  width: 28px;
  height: 28px;
  font-style: normal;
  font-weight: 900;
  border: 1px solid currentColor;
  border-radius: 50%;
  place-items: center;
  box-shadow: 0 0 16px rgba(245, 203, 115, 0.08);
}

.element-row span {
  color: rgba(247, 241, 255, 0.82);
  font-weight: 900;
}

.element-track {
  height: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
}

.element-track b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background-size: 200% 100%;
  animation: energyFlow 3.5s linear infinite;
}

.element-wood .element-track b {
  background-image: linear-gradient(90deg, #5fae6a, #a7f0a0, #5fae6a) !important;
}

.element-fire .element-track b {
  background-image: linear-gradient(90deg, #d56b4d, #ffb089, #d56b4d) !important;
}

.element-earth .element-track b {
  background-image: linear-gradient(90deg, #b98b3d, #f3cf7a, #b98b3d) !important;
}

.element-metal .element-track b {
  background-image: linear-gradient(90deg, #c99634, #fff0b8, #c99634) !important;
}

.element-water .element-track b {
  background-image: linear-gradient(90deg, #4c8eb8, #9ad8ff, #4c8eb8) !important;
}

.state-calculating .element-track b {
  animation-duration: 1.7s;
}

.state-idle .element-track b,
.state-ready .element-track b {
  opacity: 0.78;
  animation-duration: 5.4s;
}

.element-row em {
  color: rgba(247, 241, 255, 0.58);
  font-style: normal;
  text-align: right;
}

.chart-status-text {
  display: grid;
  gap: 7px;
  margin-top: 18px;
  padding: 16px 18px;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: 18px;
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 203, 115, 0.08), transparent 68%),
    rgba(255, 255, 255, 0.04);
}

.chart-status-text strong {
  color: #fff2c8;
  font-size: 18px;
  text-shadow: 0 0 16px rgba(245, 203, 115, 0.14);
}

.chart-status-text p {
  margin: 0;
  color: rgba(247, 241, 255, 0.58);
  font-size: 13px;
  line-height: 1.6;
}

.state-calculating .chart-status-text {
  border-color: rgba(245, 203, 115, 0.28);
  box-shadow: 0 0 28px rgba(245, 203, 115, 0.08);
}

.stage-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
  padding: 16px;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
}

.stage-meta span {
  display: grid;
  gap: 8px;
  justify-items: center;
  color: rgba(247, 241, 255, 0.68);
  font-size: 13px;
  line-height: 1.45;
  text-align: center;
}

@keyframes bazi-star-drift {
  from {
    background-position:
      10px 20px,
      64px 78px;
  }

  to {
    background-position:
      -120px 74px,
      210px -38px;
  }
}

@keyframes bazi-orbit-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes orbitRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes orbitReverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

@keyframes innerOrbitPulse {
  0%,
  100% {
    opacity: 0.48;
    transform: scale(1);
  }

  50% {
    opacity: 0.84;
    transform: scale(1.025);
  }
}

@keyframes bazi-grid-pulse {
  0%,
  100% {
    opacity: 0.42;
    transform: scale(1);
  }

  50% {
    opacity: 0.76;
    transform: scale(1.015);
  }
}

@keyframes corePulse {
  0%,
  100% {
    box-shadow:
      0 0 28px rgba(245, 203, 115, 0.16),
      inset 0 0 38px rgba(245, 203, 115, 0.06);
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    box-shadow:
      0 0 54px rgba(245, 203, 115, 0.34),
      0 0 20px rgba(125, 205, 255, 0.08),
      inset 0 0 48px rgba(245, 203, 115, 0.1);
    transform: translate(-50%, -50%) scale(1.035);
  }
}

@keyframes bazi-core-breathe {
  0%,
  100% {
    box-shadow:
      0 0 42px rgba(245, 203, 115, 0.1),
      inset 0 0 38px rgba(245, 203, 115, 0.06);
  }

  50% {
    box-shadow:
      0 0 60px rgba(245, 203, 115, 0.22),
      inset 0 0 48px rgba(245, 203, 115, 0.1);
  }
}

@keyframes radarSweep {
  from {
    transform: translate(-50%, -100%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -100%) rotate(360deg);
  }
}

@keyframes particleFloat {
  0%,
  100% {
    opacity: 0.32;
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    opacity: 0.82;
    transform: translate3d(8px, -10px, 0) scale(1.16);
  }
}

@keyframes markerGlow {
  0%,
  100% {
    opacity: 0.72;
    text-shadow: 0 0 12px rgba(245, 203, 115, 0.18);
  }

  50% {
    opacity: 1;
    text-shadow:
      0 0 18px rgba(245, 203, 115, 0.36),
      0 0 10px rgba(125, 205, 255, 0.08);
  }
}

@keyframes energyFlow {
  from {
    background-position: 0% 50%;
  }

  to {
    background-position: 200% 50%;
  }
}

@keyframes completeFlash {
  0% {
    box-shadow:
      inset 0 0 64px rgba(245, 203, 115, 0.045),
      0 0 24px rgba(245, 203, 115, 0.25);
  }

  50% {
    box-shadow:
      inset 0 0 90px rgba(245, 203, 115, 0.11),
      0 0 80px rgba(245, 203, 115, 0.65);
  }

  100% {
    box-shadow:
      inset 0 0 72px rgba(245, 203, 115, 0.065),
      0 0 34px rgba(245, 203, 115, 0.35);
  }
}

.meta-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 1120px) {
  .bazi-page {
    width: min(100% - 28px, 820px);
  }

  .bazi-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .bazi-page {
    width: min(100% - 20px, 520px);
    padding-top: 20px;
  }

  .bazi-control,
  .bazi-stage {
    padding: 18px;
    border-radius: 22px;
  }

  .bazi-title-block .section-title {
    font-size: 36px;
  }

  .bazi-step-line {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
    margin-top: 22px;
  }

  .bazi-step-line span {
    min-height: 46px;
    padding: 9px 10px;
    font-size: 13px;
  }

  .bazi-form {
    margin-top: 22px;
  }

  .two-cols,
  .style-card-grid {
    grid-template-columns: 1fr;
  }

  .style-card {
    min-height: 94px;
  }

  .stage-title {
    flex-direction: column;
  }

  .input-state {
    align-self: flex-start;
  }

  .chart-orbit {
    width: min(330px, 78vw);
    height: min(330px, 78vw);
    margin: 24px auto 20px;
  }

  .stem-marker {
    width: 30px;
    height: 30px;
    margin: 0;
    font-size: 21px;
    transform: translate(-50%, -50%);
  }

  .inner-stems span {
    width: 24px;
    height: 24px;
    margin: 0;
    transform: translate(-50%, -50%);
  }

  .chart-orbit-middle {
    inset: 34px;
  }

  .chart-orbit-inner {
    inset: 74px;
  }

  .chart-orbit::before {
    inset: 28px;
  }

  .chart-orbit::after {
    inset: 60px;
  }

  .orbit-grid::before {
    inset: 90px;
  }

  .chart-core {
    width: 116px;
    height: 116px;
  }

  .chart-core strong {
    font-size: 28px;
  }

  .chart-core small {
    margin-top: -24px;
  }

  .pillar-grid,
  .stage-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .element-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 420px) {
  .bazi-step-line {
    grid-template-columns: 1fr;
  }

  .chart-orbit {
    width: 280px;
    height: 280px;
  }

  .stem-marker {
    width: 28px;
    height: 28px;
    margin: 0;
    font-size: 18px;
    transform: translate(-50%, -50%);
  }

  .inner-stems span {
    width: 22px;
    height: 22px;
    margin: 0;
    font-size: 13px;
    transform: translate(-50%, -50%);
  }

  .chart-orbit-middle {
    inset: 28px;
  }

  .chart-orbit-inner {
    inset: 62px;
  }

  .chart-core {
    width: 100px;
    height: 100px;
  }

  .pillar-grid,
  .stage-meta {
    grid-template-columns: 1fr 1fr;
  }

  .element-row {
    grid-template-columns: 30px 30px minmax(0, 1fr) 42px;
    gap: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chart-orbit-layer,
  .chart-radar-sweep,
  .chart-core,
  .element-track b,
  .chart-energy-particles span,
  .stem-marker,
  .inner-stems span,
  .orbit-grid::after,
  .bazi-control::after,
  .bazi-stage::after {
    animation: none !important;
  }
}
</style>
