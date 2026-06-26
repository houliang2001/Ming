<template>
  <section class="page daily-page">
    <header class="daily-hero">
      <p class="daily-kicker">Daily Fortune</p>
      <h1 class="daily-title">今日灵签</h1>
      <p class="daily-subtitle">每日一次，借一枚温柔签文，整理当下的心绪与方向。</p>
    </header>

    <section class="fortune-stage" aria-label="今日灵签抽取区">
      <div class="fortune-card-glow" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div :class="['fortune-card', { drawing }]">
        <div class="corner corner-lt" aria-hidden="true"></div>
        <div class="corner corner-rt" aria-hidden="true"></div>
        <div class="corner corner-lb" aria-hidden="true"></div>
        <div class="corner corner-rb" aria-hidden="true"></div>
        <div class="fortune-card-badge">灵</div>
        <strong>灵犀今日签</strong>
        <small>心静一瞬<br />再取今日提醒</small>
      </div>

      <p v-if="fortune" class="today-note">这是你今日的灵签，明天可重新抽取。</p>
      <p v-else class="today-note">静心一瞬，再取今日之签</p>

      <button
        class="fortune-button"
        type="button"
        :disabled="drawing || Boolean(fortune)"
        @click="drawFortune"
      >
        <Sparkles class="button-icon" />
        {{ drawing ? '正在抽取今日灵签……' : fortune ? '今日灵签已抽取' : '抽取今日灵签' }}
      </button>
    </section>

    <section class="fortune-tips" aria-label="今日灵签说明">
      <article v-for="tip in tips" :key="tip.title">
        <component :is="tip.icon" class="tip-icon" />
        <div>
          <h2>{{ tip.title }}</h2>
          <p>{{ tip.text }}</p>
        </div>
      </article>
    </section>

    <section v-if="fortune" class="fortune-result" aria-label="今日签文结果">
      <header class="fortune-result-title">
        <span></span>
        <h2>今日签文</h2>
        <span></span>
      </header>

      <div class="fortune-result-card">
        <div class="fortune-metrics">
          <article>
            <div class="metric-score">
              <strong>{{ dailyData.score }}</strong>
            </div>
            <span>今日综合评分</span>
          </article>

          <article>
            <div class="metric-symbol leaf-symbol" aria-hidden="true"></div>
            <strong>{{ dailyData.keyword }}</strong>
            <span>今日关键词</span>
          </article>

          <article>
            <div class="metric-color" :style="{ background: luckyColorSwatch }" aria-hidden="true"></div>
            <strong>{{ dailyData.luckyColor }}</strong>
            <span>今日幸运色</span>
          </article>
        </div>

        <div class="fortune-content-grid">
          <div class="fortune-list-panel">
            <section class="fortune-mini-list good">
              <h3>
                <CircleCheck class="mini-icon" />
                宜做
              </h3>
              <ul>
                <li v-for="item in dailyData.suitable" :key="item">
                  <CircleCheck class="list-icon" />
                  {{ item }}
                </li>
              </ul>
            </section>

            <section class="fortune-mini-list avoid">
              <h3>
                <CircleX class="mini-icon" />
                忌做
              </h3>
              <ul>
                <li v-for="item in dailyData.avoid" :key="item">
                  <CircleX class="list-icon" />
                  {{ item }}
                </li>
              </ul>
            </section>
          </div>

          <blockquote class="fortune-quote-paper">
            <small>签<br />语</small>
            <p>{{ formattedQuote }}</p>
            <i>灵犀签</i>
          </blockquote>
        </div>

        <section class="fortune-advice">
          <h3>行动建议</h3>
          <p>{{ dailyData.advice }}</p>
        </section>
      </div>
    </section>

    <section class="fortune-continue">
      <div>
        <h2>继续探索更多可能</h2>
        <p>你可以继续使用塔罗牌测算当前困惑，或者查看完整四大测算入口。</p>
      </div>
      <div class="fortune-actions">
        <RouterLink class="fortune-button secondary-action" to="/tarot">
          <Sparkles class="button-icon" />
          做一次塔罗测算
        </RouterLink>
        <RouterLink class="outline-action" to="/">
          <Grid2X2 class="button-icon" />
          查看完整四大测算
        </RouterLink>
      </div>
    </section>

    <footer class="daily-disclaimer">
      <ShieldCheck class="disclaimer-icon" />
      今日灵签由 AI 生成，仅供娱乐、文化体验与自我探索参考。
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import CircleCheck from '@lucide/vue/dist/esm/icons/circle-check.mjs'
import CircleX from '@lucide/vue/dist/esm/icons/circle-x.mjs'
import Grid2X2 from '@lucide/vue/dist/esm/icons/grid-2x2.mjs'
import Leaf from '@lucide/vue/dist/esm/icons/leaf.mjs'
import ShieldCheck from '@lucide/vue/dist/esm/icons/shield-check.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import {
  generateDailyFortune,
  getTodayDailyFortuneFromCache,
} from '../utils/dailyService'

const fallbackFortune = {
  score: 82,
  keyword: '稳住节奏',
  luckyColor: '月白色',
  suitable: ['整理计划', '主动沟通', '完成一件拖延的小事'],
  avoid: ['情绪化决定', '冲动消费', '过度解释'],
  quote: '慢下来，不是停下，而是为了看清真正值得走的方向。',
  advice: '今天适合放慢节奏，先厘清思路再行动。',
}

const tips = [
  {
    title: '温和提醒',
    text: '不做绝对预测',
    icon: Leaf,
  },
  {
    title: '结合今日状态',
    text: '给出行动建议',
    icon: Sparkles,
  },
  {
    title: '仅供娱乐参考',
    text: '文化体验与自我探索',
    icon: ShieldCheck,
  },
]

const fortune = ref(null)
const drawing = ref(false)

const dailyData = computed(() => {
  const current = fortune.value || {}
  return {
    score: Number(current.score) || fallbackFortune.score,
    keyword: current.keyword || fallbackFortune.keyword,
    luckyColor: current.luckyColor || fallbackFortune.luckyColor,
    suitable: normalizeList(current.suitable, fallbackFortune.suitable),
    avoid: normalizeList(current.avoid, fallbackFortune.avoid),
    quote: current.quote || fallbackFortune.quote,
    advice: current.advice || fallbackFortune.advice,
  }
})

const formattedQuote = computed(() => formatQuote(dailyData.value.quote))
const luckyColorSwatch = computed(() => colorMap[dailyData.value.luckyColor] || '#f8efd8')

const colorMap = {
  月白色: '#f8efd8',
  竹青色: '#8fbf9f',
  黛蓝色: '#5e74a8',
  暖金色: '#f5cb73',
  云灰色: '#c8c3d2',
  浅紫色: '#c8a8ff',
}

onMounted(() => {
  const cachedFortune = getTodayDailyFortuneFromCache()

  if (cachedFortune) {
    fortune.value = cachedFortune
  }
})

async function drawFortune() {
  if (drawing.value || fortune.value) return

  drawing.value = true
  const startedAt = Date.now()

  try {
    const result = await generateDailyFortune()
    await wait(Math.max(0, 1000 - (Date.now() - startedAt)))
    fortune.value = result
    ElMessage.success('今日灵签已生成')
  } catch (error) {
    await wait(Math.max(0, 1000 - (Date.now() - startedAt)))
    ElMessage.error(error?.message || '今日灵签生成失败，请稍后重试')
  } finally {
    drawing.value = false
  }
}

function normalizeList(value, fallback) {
  return Array.isArray(value) && value.length ? value.slice(0, 3) : fallback
}

function formatQuote(text) {
  const quote = String(text || fallbackFortune.quote).trim()
  if (quote.length <= 18) return quote

  const parts = quote
    .replace(/[，,]/g, '，\n')
    .replace(/[。.!！?？]/g, '。\n')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

  return parts.length ? parts.slice(0, 5).join('\n') : quote
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
</script>

<style scoped>
.daily-page {
  position: relative;
  width: min(1120px, calc(100% - 40px));
  padding-top: 28px;
  isolation: isolate;
}

.daily-page::before,
.daily-page::after {
  position: fixed;
  inset: 76px 0 0;
  z-index: -1;
  pointer-events: none;
  content: "";
}

.daily-page::before {
  background:
    radial-gradient(circle at 50% 34%, rgba(245, 203, 115, 0.18), transparent 28%),
    radial-gradient(circle at 50% 18%, rgba(130, 80, 255, 0.2), transparent 42%),
    linear-gradient(180deg, #090714 0%, #160b2a 45%, #070713 100%);
}

.daily-page::after {
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.52) 0 1px, transparent 1px),
    radial-gradient(circle, rgba(245, 203, 115, 0.42) 0 1px, transparent 1px),
    radial-gradient(circle at 50% 32%, transparent 0 240px, rgba(245, 203, 115, 0.06) 241px 242px, transparent 243px),
    radial-gradient(circle at 50% 32%, transparent 0 320px, rgba(245, 203, 115, 0.035) 321px 322px, transparent 323px);
  background-position:
    0 0,
    48px 72px,
    center,
    center;
  background-size:
    118px 118px,
    176px 176px,
    auto,
    auto;
  opacity: 0.28;
}

.daily-hero {
  display: grid;
  justify-items: center;
  text-align: center;
  padding: 2px 0 14px;
}

.daily-kicker {
  margin: 0 0 8px;
  color: var(--gold);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0;
}

.daily-title {
  position: relative;
  margin: 0;
  color: transparent;
  font-family: var(--font-serif);
  font-size: clamp(58px, 7.6vw, 88px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0.08em;
  background: linear-gradient(180deg, #fff8df 0%, #ffe6a1 46%, #c99634 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 18px 48px rgba(245, 203, 115, 0.22);
}

.daily-title::before,
.daily-title::after {
  position: absolute;
  top: 53%;
  width: 128px;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.72), transparent);
}

.daily-title::before {
  right: calc(100% + 18px);
}

.daily-title::after {
  left: calc(100% + 18px);
}

.daily-subtitle {
  max-width: 620px;
  margin: 14px 0 0;
  color: rgba(247, 241, 255, 0.72);
  font-size: 18px;
  line-height: 1.8;
}

.fortune-stage {
  position: relative;
  display: grid;
  justify-items: center;
  min-height: 560px;
  padding-top: 18px;
}

.fortune-card-glow {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 640px;
  height: 640px;
  pointer-events: none;
  border: 1px solid rgba(245, 203, 115, 0.12);
  border-radius: 50%;
  transform: translateX(-50%);
}

.fortune-card-glow::before,
.fortune-card-glow::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: 50%;
}

.fortune-card-glow::before {
  inset: 76px;
}

.fortune-card-glow::after {
  inset: 152px;
  box-shadow: inset 0 0 80px rgba(245, 203, 115, 0.05);
}

.fortune-card-glow span {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1px;
  height: 100%;
  background: linear-gradient(transparent, rgba(245, 203, 115, 0.28), transparent);
  transform-origin: 50% 0;
}

.fortune-card-glow span:nth-child(1) {
  transform: rotate(30deg);
}

.fortune-card-glow span:nth-child(2) {
  transform: rotate(90deg);
}

.fortune-card-glow span:nth-child(3) {
  transform: rotate(150deg);
}

.fortune-card {
  position: relative;
  z-index: 1;
  display: grid;
  width: 220px;
  min-height: 360px;
  margin-top: 38px;
  padding: 34px 22px;
  overflow: hidden;
  align-content: center;
  justify-items: center;
  color: #2a1808;
  text-align: center;
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.8), transparent 34%),
    linear-gradient(155deg, #fff4bd 0%, #f7d477 46%, #bd8531 100%);
  box-shadow:
    0 0 0 1px rgba(255, 244, 194, 0.42),
    0 26px 90px rgba(245, 203, 115, 0.26),
    inset 0 0 42px rgba(255, 255, 255, 0.24);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.fortune-card::before {
  position: absolute;
  inset: 14px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(94, 55, 17, 0.2);
  border-radius: 15px;
}

.fortune-card::after {
  position: absolute;
  right: 24px;
  bottom: 20px;
  left: 24px;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(94, 55, 17, 0.34), transparent);
  box-shadow: 0 -24px 46px rgba(255, 255, 255, 0.24);
}

.fortune-card.drawing {
  animation: card-draw 1.05s ease-in-out infinite;
  box-shadow:
    0 0 0 1px rgba(255, 244, 194, 0.5),
    0 32px 108px rgba(245, 203, 115, 0.42),
    inset 0 0 54px rgba(255, 255, 255, 0.3);
}

.corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: rgba(94, 55, 17, 0.24);
}

.corner-lt {
  top: 18px;
  left: 18px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.corner-rt {
  top: 18px;
  right: 18px;
  border-top: 1px solid;
  border-right: 1px solid;
}

.corner-lb {
  bottom: 18px;
  left: 18px;
  border-bottom: 1px solid;
  border-left: 1px solid;
}

.corner-rb {
  right: 18px;
  bottom: 18px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.fortune-card-badge {
  display: grid;
  width: 54px;
  height: 54px;
  margin-bottom: 18px;
  color: #271707;
  font-size: 28px;
  font-weight: 900;
  border: 1px solid rgba(94, 55, 17, 0.18);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.24);
  place-items: center;
}

.fortune-card strong {
  max-width: 42px;
  color: #2b1908;
  font-family: var(--font-serif);
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 0.18em;
  line-height: 1.65;
  writing-mode: vertical-rl;
}

.fortune-card small {
  margin-top: 18px;
  color: rgba(42, 24, 8, 0.82);
  font-weight: 900;
  line-height: 1.6;
}

.today-note {
  position: relative;
  z-index: 1;
  margin: 24px 0 16px;
  color: #fff0b8;
  font-size: 17px;
  font-weight: 900;
  text-shadow: 0 0 18px rgba(245, 203, 115, 0.22);
}

.today-note::before,
.today-note::after {
  margin: 0 10px;
  color: var(--gold);
  content: "✦";
}

.fortune-button,
.outline-action {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  min-width: 300px;
  padding: 0 30px;
  color: #201407;
  font-weight: 900;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff0b8, #f5c76a 52%, #c99634);
  box-shadow:
    0 16px 36px rgba(245, 203, 115, 0.26),
    0 0 24px rgba(245, 203, 115, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.fortune-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 46px rgba(245, 203, 115, 0.34),
    0 0 34px rgba(245, 203, 115, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.fortune-button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

.fortune-tips {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  max-width: 860px;
  margin: 0 auto 24px;
  padding: 14px 18px;
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
}

.fortune-tips article {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 58px;
  padding: 0 22px;
  border-right: 1px solid rgba(245, 203, 115, 0.12);
}

.fortune-tips article:last-child {
  border-right: 0;
}

.tip-icon {
  display: grid;
  width: 38px;
  height: 38px;
  padding: 8px;
  color: var(--gold);
  border: 1px solid rgba(245, 203, 115, 0.26);
  border-radius: 50%;
  background: rgba(245, 203, 115, 0.08);
}

.fortune-tips h2 {
  margin: 0;
  color: var(--gold);
  font-size: 15px;
}

.fortune-tips p {
  margin: 3px 0 0;
  color: rgba(247, 241, 255, 0.66);
  font-size: 13px;
}

.fortune-result {
  margin-top: 20px;
}

.fortune-result-title {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.fortune-result-title span {
  width: 86px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.82), transparent);
}

.fortune-result-title h2 {
  margin: 0;
  color: #fff2c8;
  font-family: var(--font-serif);
  font-size: 30px;
  letter-spacing: 0.12em;
}

.fortune-result-card {
  position: relative;
  overflow: hidden;
  padding: 30px 40px;
  border: 1px solid rgba(245, 203, 115, 0.28);
  border-radius: 24px;
  background:
    radial-gradient(circle at 76% 14%, rgba(245, 203, 115, 0.12), transparent 30%),
    radial-gradient(circle at 12% 8%, rgba(130, 80, 255, 0.14), transparent 34%),
    rgba(255, 255, 255, 0.05);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.35),
    inset 0 0 42px rgba(245, 203, 115, 0.035);
  backdrop-filter: blur(18px);
}

.fortune-result-card::before,
.fortune-result-card::after {
  position: absolute;
  width: 78px;
  height: 78px;
  pointer-events: none;
  content: "";
  border-color: rgba(245, 203, 115, 0.24);
}

.fortune-result-card::before {
  top: 12px;
  left: 12px;
  border-top: 1px solid;
  border-left: 1px solid;
  border-radius: 18px 0 0;
}

.fortune-result-card::after {
  right: 12px;
  bottom: 12px;
  border-right: 1px solid;
  border-bottom: 1px solid;
  border-radius: 0 0 18px;
}

.fortune-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(340px, 1.15fr);
  gap: 16px;
  align-items: stretch;
  margin-bottom: -1px;
}

.fortune-metrics article {
  display: grid;
  min-height: 122px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  align-content: center;
  justify-items: center;
}

.metric-score {
  display: grid;
  width: 62px;
  height: 62px;
  margin-bottom: 8px;
  border: 5px solid rgba(245, 203, 115, 0.42);
  border-right-color: rgba(245, 203, 115, 0.94);
  border-radius: 50%;
  place-items: center;
}

.metric-score strong,
.fortune-metrics article > strong {
  color: #fff2b8;
  font-size: 24px;
  line-height: 1.2;
}

.fortune-metrics span {
  margin-top: 4px;
  color: rgba(247, 241, 255, 0.68);
  font-size: 13px;
}

.leaf-symbol {
  width: 44px;
  height: 44px;
  margin-bottom: 8px;
  border-radius: 50% 4px 50% 50%;
  background:
    radial-gradient(circle at 28% 28%, rgba(255, 255, 255, 0.52), transparent 34%),
    linear-gradient(135deg, #fff0b8, #9f7bff);
  transform: rotate(-32deg);
}

.metric-color {
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(245, 203, 115, 0.16);
}

.fortune-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 1.15fr);
  gap: 24px;
  align-items: stretch;
  margin-top: 16px;
}

.fortune-list-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.fortune-mini-list {
  padding: 18px;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
}

.fortune-mini-list h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 12px;
  color: #fff0b8;
  font-size: 17px;
}

.mini-icon {
  width: 18px;
  height: 18px;
}

.good .mini-icon,
.good .list-icon {
  color: #9ada5b;
}

.avoid .mini-icon,
.avoid .list-icon {
  color: #ff7777;
}

.fortune-mini-list ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fortune-mini-list li {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgba(247, 241, 255, 0.76);
  line-height: 1.5;
}

.list-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.fortune-quote-paper {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 18px;
  min-height: 228px;
  margin: -138px 0 0;
  padding: 34px 34px 28px;
  color: #321f0e;
  border: 1px solid rgba(75, 43, 15, 0.16);
  border-radius: 10px;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.55), transparent 34%),
    linear-gradient(145deg, #f9e9c9, #e2c28f);
  box-shadow:
    0 24px 54px rgba(0, 0, 0, 0.34),
    inset 0 0 42px rgba(255, 255, 255, 0.18);
}

.fortune-quote-paper::before {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(75, 43, 15, 0.1);
}

.fortune-quote-paper small {
  padding-top: 6px;
  color: rgba(50, 31, 14, 0.72);
  font-size: 18px;
  font-weight: 900;
  line-height: 1.6;
  text-align: center;
  border-right: 1px solid rgba(75, 43, 15, 0.12);
}

.fortune-quote-paper p {
  margin: 0;
  align-self: center;
  color: #2a1a0c;
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 900;
  line-height: 1.75;
  white-space: pre-line;
}

.fortune-quote-paper i {
  position: absolute;
  right: 24px;
  bottom: 22px;
  display: grid;
  width: 38px;
  height: 38px;
  color: rgba(156, 57, 43, 0.58);
  font-size: 11px;
  font-style: normal;
  border: 1px solid rgba(156, 57, 43, 0.26);
  border-radius: 50%;
  place-items: center;
  transform: rotate(-12deg);
}

.fortune-advice {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(245, 203, 115, 0.14);
}

.fortune-advice h3 {
  margin: 0 0 10px;
  color: var(--gold);
  font-size: 18px;
}

.fortune-advice p {
  margin: 0;
  color: rgba(247, 241, 255, 0.74);
  line-height: 1.95;
}

.fortune-continue {
  position: relative;
  margin-top: 28px;
  padding: 32px 40px;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: 24px;
  background:
    radial-gradient(circle at 15% 10%, rgba(245, 203, 115, 0.1), transparent 30%),
    radial-gradient(circle at 84% 78%, rgba(130, 80, 255, 0.12), transparent 28%),
    rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

.fortune-continue h2 {
  margin: 0;
  color: #fff0b8;
  font-family: var(--font-serif);
  font-size: 30px;
}

.fortune-continue p {
  margin: 12px 0 24px;
  color: rgba(247, 241, 255, 0.72);
  line-height: 1.75;
}

.fortune-actions {
  display: flex;
  gap: 28px;
  justify-content: center;
  flex-wrap: wrap;
}

.secondary-action {
  min-width: 260px;
}

.outline-action {
  min-width: 260px;
  color: #f7f1ff;
  border: 1px solid rgba(245, 203, 115, 0.38);
  background: rgba(255, 255, 255, 0.035);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.daily-disclaimer {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
  color: rgba(247, 241, 255, 0.52);
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}

.disclaimer-icon {
  width: 16px;
  height: 16px;
  color: rgba(245, 203, 115, 0.68);
  flex: 0 0 auto;
}

@keyframes card-draw {
  0%,
  100% {
    transform: translateY(0) rotateY(0deg);
  }
  50% {
    transform: translateY(-10px) rotateY(8deg);
  }
}

@media (max-width: 980px) {
  .fortune-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .fortune-content-grid {
    grid-template-columns: 1fr;
  }

  .fortune-quote-paper {
    margin: 0;
  }
}

@media (max-width: 720px) {
  .daily-page {
    width: min(100% - 32px, 560px);
    padding-top: 22px;
  }

  .daily-title {
    font-size: 44px;
    letter-spacing: 0.04em;
  }

  .daily-title::before,
  .daily-title::after {
    display: none;
  }

  .daily-subtitle {
    font-size: 15px;
  }

  .fortune-stage {
    min-height: 470px;
  }

  .fortune-card-glow {
    top: 24px;
    width: 420px;
    height: 420px;
  }

  .fortune-card-glow::before {
    inset: 48px;
  }

  .fortune-card-glow::after {
    inset: 96px;
  }

  .fortune-card {
    width: 180px;
    min-height: 300px;
    margin-top: 34px;
    padding: 28px 18px;
  }

  .fortune-card-badge {
    width: 46px;
    height: 46px;
    font-size: 23px;
  }

  .fortune-card strong {
    font-size: 25px;
  }

  .fortune-button,
  .outline-action {
    width: 100%;
    min-width: 0;
  }

  .fortune-tips {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }

  .fortune-tips article {
    padding: 12px;
    border-right: 0;
    border-bottom: 1px solid rgba(245, 203, 115, 0.1);
  }

  .fortune-tips article:last-child {
    border-bottom: 0;
  }

  .fortune-result-card {
    padding: 22px 18px;
  }

  .fortune-metrics,
  .fortune-list-panel {
    grid-template-columns: 1fr;
  }

  .fortune-content-grid {
    gap: 16px;
  }

  .fortune-quote-paper {
    grid-template-columns: 42px minmax(0, 1fr);
    min-height: 210px;
    padding: 26px 20px;
  }

  .fortune-quote-paper p {
    font-size: 23px;
  }

  .fortune-result-title h2,
  .fortune-continue h2 {
    font-size: 24px;
  }

  .fortune-result-title span {
    width: 42px;
  }

  .fortune-continue {
    padding: 26px 18px;
  }

  .fortune-actions {
    gap: 12px;
  }

  .daily-disclaimer {
    align-items: flex-start;
  }
}

@media (max-width: 380px) {
  .daily-page {
    width: min(100% - 24px, 520px);
  }

  .daily-title {
    font-size: 40px;
  }

  .fortune-card-glow {
    width: 360px;
    height: 360px;
  }

  .fortune-card {
    width: 170px;
    min-height: 286px;
  }
}
</style>
