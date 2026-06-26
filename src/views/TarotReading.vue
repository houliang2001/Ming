<template>
  <section class="page tarot-page">
    <div class="tarot-layout">
      <div class="tarot-control glass-panel">
        <div class="tarot-title-block">
          <p class="eyebrow ornate">Tarot Reading</p>
          <h1 class="section-title">塔罗牌占卜</h1>
          <p class="section-lead">输入你的问题，选择牌阵，洗牌抽牌，即可获得专属的 AI 解读与指引。</p>
        </div>

        <div class="tarot-step-line" aria-label="塔罗牌测算流程">
          <span v-for="(step, index) in steps" :key="step" :class="{ active: currentStep >= index + 1 }">
            <b>{{ index + 1 }}</b>
            {{ step }}
          </span>
        </div>

        <div class="form-stack tarot-form">
          <div class="question-field">
            <label class="tarot-field-label">
              <Sparkles class="label-icon" />
              你最想确认的问题
            </label>
            <el-input
              v-model="question"
              type="textarea"
              :rows="4"
              maxlength="200"
              resize="none"
              placeholder="例如：这段关系接下来会如何发展？"
            />
            <span class="question-count">{{ question.length }} / 200</span>
          </div>

          <div>
            <label class="tarot-field-label">
              <Sparkles class="label-icon" />
              选择牌阵
            </label>
            <div class="spread-grid">
              <button
                v-for="item in spreadOptions"
                :key="item.value"
                :class="['spread-option', { active: spread === item.value }]"
                type="button"
                @click="spread = item.value"
              >
                <component :is="item.icon" class="spread-icon" />
                {{ item.label }}
                <small>{{ item.hint }}</small>
              </button>
            </div>
          </div>

          <div>
            <label class="tarot-field-label subtle">报告风格 <small>可选</small></label>
            <div class="style-pill-grid">
              <button
                v-for="style in reportStyles"
                :key="style"
                :class="['style-pill', { active: reportStyle === style }]"
                type="button"
                @click="reportStyle = style"
              >
                <component :is="styleIconMap[style]" class="button-icon" />
                <strong>{{ style }}</strong>
              </button>
            </div>
          </div>

          <div class="tarot-actions">
            <button class="primary-button action-button" type="button" :disabled="loading" @click="shuffleCards">
              <Sparkles class="action-star left" />
              <RefreshCw class="button-icon" />
              开始洗牌
              <Sparkles class="action-star right" />
            </button>
            <button
              class="ghost-button action-button"
              type="button"
              :disabled="shuffling || loading"
              @click="randomQuestion"
            >
              <Shuffle class="button-icon" />
              随机问题
            </button>
            <button
              class="ghost-button action-button"
              type="button"
              :disabled="!selectedCards.length || shuffling || loading"
              @click="viewResult"
            >
              <Eye class="button-icon" />
              查看解读
            </button>
          </div>
        </div>
      </div>

      <div class="tarot-stage glass-panel">
        <header class="stage-head">
          <span></span>
          <h2>当前牌阵预览</h2>
          <span></span>
        </header>

        <div class="stage-orbit" aria-hidden="true"></div>

        <div :class="['deck-aura', { shuffling }]">
          <div v-for="(card, index) in cardSlots" :key="`${card?.name || 'back'}-${index}`" class="card-slot">
            <TarotCard
              :card="card"
              :flipped="Boolean(card) && !shuffling"
              :label="slotLabels[index] || '灵犀牌'"
            />
            <strong>{{ slotLabels[index] || '指引' }}</strong>
          </div>
        </div>

        <p class="stage-caption">
          <Sparkles class="caption-icon" />
          {{ stageCaption }}
        </p>

        <div class="stage-meta">
          <span>
            <ScrollText class="meta-icon" />
            <small>已选择牌阵</small>
            <strong>{{ spread }}</strong>
          </span>
          <span>
            <Clock class="meta-icon" />
            <small>预计解读时间</small>
            <strong>10-20秒</strong>
          </span>
          <span>
            <Sparkles class="meta-icon large" />
            <small>AI 解读</small>
            <strong>娱乐与自我探索参考</strong>
          </span>
        </div>
      </div>
    </div>

    <LoadingAnalyze
      :active="loading"
      title="正在生成塔罗解读"
      :messages="[
        '正在整理牌面信息……',
        '正在分析你的问题与牌阵能量……',
        '正在生成你的专属塔罗报告……',
      ]"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import BriefcaseBusiness from '@lucide/vue/dist/esm/icons/briefcase-business.mjs'
import Clock from '@lucide/vue/dist/esm/icons/clock-3.mjs'
import Coins from '@lucide/vue/dist/esm/icons/coins.mjs'
import Eye from '@lucide/vue/dist/esm/icons/eye.mjs'
import Heart from '@lucide/vue/dist/esm/icons/heart.mjs'
import PenLine from '@lucide/vue/dist/esm/icons/pen-line.mjs'
import RefreshCw from '@lucide/vue/dist/esm/icons/refresh-cw.mjs'
import ScrollText from '@lucide/vue/dist/esm/icons/scroll-text.mjs'
import Shuffle from '@lucide/vue/dist/esm/icons/shuffle.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import LoadingAnalyze from '../components/LoadingAnalyze.vue'
import TarotCard from '../components/TarotCard.vue'
import { generateTarotAIReport } from '../utils/aiService'
import { saveReport } from '../utils/storage'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'

const router = useRouter()
const question = ref('')
const spread = ref('三张牌')
const reportStyle = ref('温和指引')
const selectedCards = ref([])
const shuffling = ref(false)
const loading = ref(false)
let shuffleTimer = null

const steps = ['提出问题', '选择牌阵', '洗牌抽牌', 'AI解读']

const spreadOptions = [
  { label: '单张指引', value: '单张牌', count: 1, hint: '快速确认', icon: ScrollText },
  { label: '三张牌', value: '三张牌', count: 3, hint: '过去 / 现在 / 未来', icon: Sparkles },
  { label: '感情牌阵', value: '感情牌阵', count: 3, hint: '关系走向', icon: Heart },
  { label: '事业牌阵', value: '事业牌阵', count: 3, hint: '机会与阻力', icon: BriefcaseBusiness },
  { label: '财富牌阵', value: '财富牌阵', count: 3, hint: '节奏与风险', icon: Coins },
]

const reportStyles = ['温和指引', '感情重点', '事业重点']
const styleIconMap = {
  温和指引: Heart,
  感情重点: PenLine,
  事业重点: BriefcaseBusiness,
}

const randomQuestions = [
  '我现在最需要看清的方向是什么？',
  '这段关系接下来需要注意什么？',
  '近期事业上有哪些机会和阻力？',
  '我应该如何调整自己的行动节奏？',
  '当前困惑背后真正的提醒是什么？',
]

const deck = [
  { name: '愚者', meaning: '新的开始、探索、放下过度预设' },
  { name: '魔术师', meaning: '资源整合、主动表达、把想法落地' },
  { name: '女祭司', meaning: '直觉、内在答案、暂时观察' },
  { name: '皇后', meaning: '滋养、关系温度、创造力' },
  { name: '皇帝', meaning: '秩序、边界、现实掌控' },
  { name: '恋人', meaning: '选择、关系、价值观对齐' },
  { name: '战车', meaning: '推进、意志力、方向统一' },
  { name: '力量', meaning: '温柔的坚持、耐心、自我调节' },
  { name: '隐者', meaning: '沉淀、独处、寻找真正答案' },
  { name: '命运之轮', meaning: '变化、周期、转折信号' },
  { name: '正义', meaning: '公平、判断、因果平衡' },
  { name: '倒吊人', meaning: '暂停、换角度、重新理解' },
  { name: '死神', meaning: '结束旧阶段、更新、转化' },
  { name: '节制', meaning: '调和、节奏、温和修复' },
  { name: '星星', meaning: '希望、疗愈、长线信念' },
  { name: '月亮', meaning: '不确定、潜意识、看清迷雾' },
  { name: '太阳', meaning: '清晰、活力、正向显现' },
  { name: '审判', meaning: '复盘、觉醒、做出决定' },
  { name: '世界', meaning: '完成、整合、阶段成果' },
]

const count = computed(() => spreadOptions.find((item) => item.value === spread.value)?.count || 3)
const slotLabels = computed(() => {
  if (spread.value === '单张牌') return ['指引']
  if (spread.value === '感情牌阵') return ['自己', '对方', '关系']
  if (spread.value === '事业牌阵') return ['优势', '阻力', '机会']
  if (spread.value === '财富牌阵') return ['现状', '风险', '增长']
  return ['过去', '现在', '未来']
})

const cardSlots = computed(() => {
  if (selectedCards.value.length) return selectedCards.value
  return Array.from({ length: count.value }, () => null)
})

const currentStep = computed(() => {
  if (loading.value || selectedCards.value.length) return 4
  if (shuffling.value) return 3
  if (spread.value) return 2
  return question.value.trim() ? 1 : 0
})

const stageCaption = computed(() => {
  if (shuffling.value) return '牌阵正在洗牌中……'
  if (selectedCards.value.length) return '牌已揭示，点击查看解读生成 AI 报告。'
  return '请先选择牌阵并开始洗牌。'
})

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function shuffleCards() {
  if (loading.value) return

  selectedCards.value = []
  shuffling.value = true
  shuffleTimer = window.setTimeout(() => {
    selectedCards.value = pickCards(count.value)
    shuffling.value = false
  }, 1200)
}

function randomQuestion() {
  const next = randomQuestions[Math.floor(Math.random() * randomQuestions.length)]
  question.value = next
}

function pickCards(total) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, total).map((card) => ({
    ...card,
    orientation: Math.random() > 0.35 ? '正位' : '逆位',
  }))
}

async function viewResult() {
  if (!selectedCards.value.length || loading.value) return

  loading.value = true
  const startedAt = Date.now()

  try {
    const report = await generateTarotAIReport({
      question: question.value.trim() || '近期综合运势',
      spreadType: spread.value,
      reportStyle: reportStyle.value,
      cards: selectedCards.value.map((card) => ({
        name: card.name,
        position: card.orientation,
        meaning: card.meaning,
      })),
    })
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    saveReport(report)
    router.push({ name: 'result', params: { id: report.id } })
  } catch {
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    ElMessage.error('AI分析服务暂时不可用，请稍后重试')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(shuffleTimer)
})
</script>

<style scoped>
.tarot-page {
  width: min(1440px, calc(100% - 56px));
  padding-top: 28px;
}

.tarot-layout {
  display: grid;
  grid-template-columns: minmax(420px, 0.84fr) minmax(0, 1fr);
  gap: 26px;
  align-items: stretch;
}

.tarot-control,
.tarot-stage {
  position: relative;
  overflow: hidden;
  border-color: rgba(245, 203, 115, 0.22);
  background:
    radial-gradient(circle at 12% 10%, rgba(245, 203, 115, 0.1), transparent 28%),
    radial-gradient(circle at 82% 6%, rgba(177, 139, 255, 0.12), transparent 32%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)),
    rgba(16, 11, 30, 0.86);
}

.tarot-control {
  padding: 30px;
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

.tarot-title-block .section-title {
  margin-bottom: 14px;
  color: #fff2c8;
  font-family: var(--font-serif);
  font-size: clamp(42px, 4.2vw, 64px);
  font-weight: 900;
  text-shadow: 0 0 24px rgba(245, 203, 115, 0.22);
}

.tarot-step-line {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin: 30px 0 0;
}

.tarot-step-line::before {
  position: absolute;
  top: 17px;
  right: 8%;
  left: 8%;
  height: 1px;
  content: "";
  border-top: 1px dashed rgba(247, 241, 255, 0.18);
}

.tarot-step-line span {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  justify-items: center;
  color: rgba(247, 241, 255, 0.62);
  font-size: 14px;
  text-align: center;
}

.tarot-step-line b {
  display: grid;
  width: 38px;
  height: 38px;
  color: rgba(247, 241, 255, 0.78);
  border: 1px solid rgba(245, 203, 115, 0.32);
  border-radius: 50%;
  background: rgba(14, 10, 24, 0.92);
  place-items: center;
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.35);
}

.tarot-step-line span.active b {
  color: #fff7d3;
  border-color: rgba(245, 203, 115, 0.76);
  background:
    radial-gradient(circle, rgba(177, 91, 255, 0.52), rgba(14, 10, 24, 0.92));
  box-shadow: 0 0 24px rgba(177, 91, 255, 0.45), 0 0 18px rgba(245, 203, 115, 0.2);
}

.tarot-form {
  margin-top: 28px;
}

.tarot-field-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  color: rgba(247, 241, 255, 0.86);
  font-weight: 900;
}

.tarot-field-label.subtle {
  color: rgba(247, 241, 255, 0.78);
}

.tarot-field-label small {
  color: rgba(247, 241, 255, 0.48);
  font-weight: 700;
}

.label-icon {
  width: 18px;
  height: 18px;
  color: var(--gold);
  filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.32));
}

.question-field {
  position: relative;
}

.question-field :deep(.el-textarea__inner) {
  min-height: 112px !important;
  padding: 16px;
  border-color: rgba(245, 203, 115, 0.28);
  border-radius: 18px;
  background:
    radial-gradient(circle at 80% 0%, rgba(177, 139, 255, 0.1), transparent 42%),
    rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.18);
}

.question-count {
  position: absolute;
  right: 16px;
  bottom: 12px;
  color: rgba(247, 241, 255, 0.42);
  font-size: 12px;
}

.spread-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.spread-option {
  display: grid;
  min-height: 84px;
  padding: 13px 10px;
  justify-items: center;
  align-content: center;
  gap: 6px;
  color: rgba(247, 241, 255, 0.74);
  font-weight: 900;
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(255, 255, 255, 0.035);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.spread-option:hover,
.spread-option.active {
  color: #fff4cf;
  border-color: rgba(203, 123, 255, 0.88);
  background:
    radial-gradient(circle at 50% 8%, rgba(203, 123, 255, 0.32), transparent 68%),
    rgba(245, 203, 115, 0.08);
  box-shadow: 0 0 24px rgba(203, 123, 255, 0.34), inset 0 0 22px rgba(245, 203, 115, 0.05);
  transform: translateY(-2px);
}

.spread-icon {
  width: 25px;
  height: 25px;
  color: var(--gold);
}

.spread-option small {
  color: rgba(247, 241, 255, 0.52);
  font-size: 12px;
  line-height: 1.35;
}

.style-pill-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.style-pill {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  color: rgba(247, 241, 255, 0.78);
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.045);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.style-pill.active,
.style-pill:hover {
  color: #fff2c8;
  border-color: rgba(245, 203, 115, 0.72);
  background: rgba(245, 203, 115, 0.11);
  transform: translateY(-1px);
}

.tarot-actions {
  display: grid;
  grid-template-columns: minmax(180px, 1.2fr) minmax(150px, 0.9fr) minmax(150px, 0.9fr);
  gap: 14px;
}

.action-button {
  position: relative;
  min-width: 0;
  padding: 0 20px;
  overflow: hidden;
  font-weight: 900;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.action-star {
  position: absolute;
  width: 16px;
  height: 16px;
  color: rgba(255, 246, 201, 0.84);
}

.action-star.left {
  left: 18px;
}

.action-star.right {
  right: 18px;
}

.tarot-stage {
  display: grid;
  min-height: 680px;
  padding: 32px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 42%, rgba(245, 203, 115, 0.14), transparent 39%),
    radial-gradient(circle at 45% 38%, rgba(177, 91, 255, 0.15), transparent 34%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    rgba(12, 8, 22, 0.86);
  align-content: center;
  justify-items: center;
}

.stage-head {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.stage-head span {
  width: 96px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.78), transparent);
}

.stage-head h2 {
  margin: 0;
  color: #fff2c8;
  font-family: var(--font-serif);
  font-size: 30px;
  text-shadow: 0 0 22px rgba(245, 203, 115, 0.2);
}

.stage-orbit {
  position: absolute;
  top: 92px;
  left: 50%;
  width: min(680px, 78vw);
  height: min(680px, 78vw);
  pointer-events: none;
  border: 1px solid rgba(245, 203, 115, 0.1);
  border-radius: 50%;
  transform: translateX(-50%);
}

.stage-orbit::before,
.stage-orbit::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.08);
  border-radius: 50%;
}

.stage-orbit::before {
  inset: 58px;
}

.stage-orbit::after {
  inset: 124px;
}

.deck-aura {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  min-height: 310px;
  padding: 28px 16px;
  gap: clamp(22px, 4vw, 48px);
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.card-slot {
  display: grid;
  gap: 18px;
  justify-items: center;
}

.card-slot strong {
  color: var(--gold-light);
  font-size: 20px;
  text-shadow: 0 0 14px rgba(245, 203, 115, 0.22);
}

.deck-aura.shuffling :deep(.tarot-card:nth-child(1)) {
  animation: shuffle-left 0.62s ease-in-out infinite alternate;
}

.deck-aura.shuffling :deep(.tarot-card:nth-child(2)) {
  animation: shuffle-mid 0.58s ease-in-out infinite alternate;
}

.deck-aura.shuffling :deep(.tarot-card:nth-child(3)) {
  animation: shuffle-right 0.66s ease-in-out infinite alternate;
}

.stage-caption {
  position: relative;
  z-index: 2;
  display: inline-flex;
  gap: 14px;
  align-items: center;
  max-width: 660px;
  min-height: 58px;
  margin: 10px 0 0;
  padding: 14px 26px;
  color: rgba(247, 241, 255, 0.78);
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.055);
}

.caption-icon {
  width: 22px;
  height: 22px;
  color: var(--gold);
  flex: 0 0 auto;
}

.stage-meta {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: min(760px, 100%);
  gap: 0;
  margin-top: 32px;
  padding: 18px 20px;
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
}

.stage-meta span {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2px 14px;
  align-items: center;
  padding: 0 18px;
  border-right: 1px solid rgba(245, 203, 115, 0.12);
}

.stage-meta span:last-child {
  border-right: 0;
}

.meta-icon {
  grid-row: span 2;
  width: 32px;
  height: 32px;
  color: var(--gold);
}

.meta-icon.large {
  width: 36px;
  height: 36px;
}

.stage-meta small {
  color: rgba(247, 241, 255, 0.56);
}

.stage-meta strong {
  color: var(--gold-light);
  font-size: 18px;
  line-height: 1.35;
}

@keyframes shuffle-left {
  to {
    transform: translateX(22px) rotate(-6deg);
  }
}

@keyframes shuffle-mid {
  to {
    transform: translateY(-12px) rotate(5deg);
  }
}

@keyframes shuffle-right {
  to {
    transform: translateX(-22px) rotate(7deg);
  }
}

@media (max-width: 980px) {
  .tarot-page {
    width: min(100% - 28px, 760px);
  }

  .tarot-layout {
    grid-template-columns: 1fr;
  }

  .tarot-stage {
    min-height: 560px;
  }

  .spread-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tarot-actions {
    grid-template-columns: 1fr;
  }

  .stage-meta {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .stage-meta span {
    padding: 0;
    border-right: 0;
  }
}

@media (max-width: 620px) {
  .tarot-page {
    width: min(100% - 20px, 520px);
    padding-top: 20px;
  }

  .tarot-control,
  .tarot-stage {
    padding: 18px;
    border-radius: 22px;
  }

  .tarot-form {
    margin-top: 20px;
  }

  .tarot-title-block .section-title {
    font-size: 36px;
  }

  .tarot-step-line {
    gap: 8px;
    margin-top: 22px;
  }

  .tarot-step-line span {
    font-size: 12px;
  }

  .tarot-step-line b {
    width: 30px;
    height: 30px;
  }

  .tarot-step-line::before {
    top: 14px;
  }

  .question-field :deep(.el-textarea__inner) {
    min-height: 118px !important;
  }

  .spread-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .spread-option {
    min-height: 82px;
  }

  .style-pill-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .tarot-stage {
    min-height: 520px;
  }

  .stage-head {
    gap: 10px;
    margin-bottom: 14px;
  }

  .stage-head h2 {
    font-size: 22px;
    white-space: nowrap;
  }

  .stage-head span {
    width: 38px;
  }

  .deck-aura {
    min-height: 230px;
    gap: 14px;
    padding: 16px 0;
  }

  .action-button {
    width: 100%;
  }

  .card-slot {
    gap: 10px;
  }

  .card-slot strong {
    font-size: 15px;
  }

  .stage-caption {
    display: flex;
    align-items: flex-start;
    min-height: auto;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.6;
  }

  .stage-meta {
    margin-top: 18px;
    padding: 14px;
  }

  .stage-meta strong {
    font-size: 15px;
  }
}

@media (max-width: 380px) {
  .spread-grid {
    grid-template-columns: 1fr;
  }

  .tarot-step-line {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tarot-step-line::before {
    display: none;
  }
}
</style>
