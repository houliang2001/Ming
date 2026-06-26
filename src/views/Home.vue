<template>
  <div class="home">
    <section
      class="hero"
      :style="{ backgroundImage: `linear-gradient(90deg, rgba(5, 4, 12, 0.96), rgba(8, 6, 18, 0.72) 42%, rgba(8, 6, 18, 0.34)), url(${heroImage})` }"
    >
      <div class="hero-shell">
        <div class="hero-copy">
          <p class="hero-badge">
            <Sparkles class="badge-icon" />
            AI玄学测算 · 免费体验版
          </p>
          <h1>
            <span>看见你的</span>
            <strong>命运线索</strong>
          </h1>
          <p class="hero-subtitle">
            通过手相、面相、生辰八字与塔罗牌，生成你的专属 AI 运势解析。
          </p>

          <div class="hero-actions">
            <button class="hero-button" type="button" @click="openStartDialog">
              <Sparkles class="button-icon" />
              立即开始测算
            </button>
            <RouterLink class="ghost-button hero-secondary" to="/daily">
              <Scroll class="button-icon" />
              今日灵签
            </RouterLink>
          </div>

          <div class="hero-trust">
            <article v-for="item in trustItems" :key="item.title" class="trust-item">
              <component :is="item.icon" class="trust-icon" />
              <span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.text }}</small>
              </span>
            </article>
          </div>
        </div>

        <aside class="hero-oracle" aria-label="灵犀阁视觉星盘">
          <div class="cosmic-plate">
            <span class="data-orbit data-orbit-one"></span>
            <span class="data-orbit data-orbit-two"></span>
            <span class="data-orbit data-orbit-three"></span>
            <span class="data-orbit data-orbit-four"></span>
            <span class="scan-axis scan-axis-vertical"></span>
            <span class="scan-axis scan-axis-horizontal"></span>
            <span class="planet planet-one"></span>
            <span class="planet planet-two"></span>
            <span class="planet planet-three"></span>
            <span class="data-node node-one"></span>
            <span class="data-node node-two"></span>
            <span class="data-node node-three"></span>
            <span class="data-node node-four"></span>
            <span class="data-node node-five"></span>
            <div class="fate-core" aria-hidden="true">
              <span class="core-halo"></span>
              <span class="core-crystal"></span>
              <span class="core-ring"></span>
            </div>
            <div class="core-caption" aria-hidden="true">
              <span>Fate Core</span>
              <small>AI Cosmic Engine</small>
            </div>
          </div>

          <div v-if="false" class="oracle-card" aria-hidden="true">
            <div>
              <small>Today's Insight</small>
              <strong>AI × 东方玄学</strong>
              <p>以温和提醒，帮你多看见一种可能。</p>
            </div>
            <Sparkles class="oracle-spark" />
          </div>
        </aside>
      </div>

      <div class="hero-feature-grid" aria-label="测算入口">
        <FeatureCard
          v-for="feature in features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :to="feature.to"
          :icon="feature.icon"
          :symbol="feature.symbol"
        />
      </div>
    </section>

    <Teleport to="body">
      <Transition name="start-modal">
        <div v-if="startDialogVisible" class="start-modal-layer" role="dialog" aria-modal="true" aria-labelledby="start-modal-title">
          <button class="start-modal-backdrop" type="button" aria-label="关闭测算选择" @click="closeStartDialog"></button>
          <section class="start-modal" @click.stop>
            <header class="start-modal-head">
              <div>
                <p class="eyebrow">Choose Method</p>
                <h2 id="start-modal-title">选择测算方式</h2>
              </div>
              <button class="modal-close" type="button" aria-label="关闭测算选择" @click="closeStartDialog">
                <X class="button-icon" />
              </button>
            </header>

            <div class="start-option-grid">
              <RouterLink
                v-for="feature in features"
                :key="feature.title"
                class="start-option"
                :to="feature.to"
                @click="closeStartDialog"
              >
                <span class="start-option-icon">
                  <component :is="feature.icon" class="icon" />
                </span>
                <span>
                  <strong>{{ feature.title }}</strong>
                  <small>{{ feature.description }}</small>
                </span>
                <ArrowRight class="start-option-arrow" />
              </RouterLink>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>

    <section class="page daily-entry-section">
      <RouterLink class="daily-entry glass-panel gold-frame" to="/daily">
        <div class="daily-slip">
          <Scroll class="daily-icon" />
          <strong>今日灵签</strong>
          <small>每日一次，给当下的自己一个温和提醒。</small>
        </div>
        <div class="daily-entry-copy">
          <p class="eyebrow">Daily Fortune</p>
          <h2>抽取今日关键词、宜忌与行动建议</h2>
          <p>不用给自己太大压力，一条轻量签语就够照亮今天的一小步。</p>
        </div>
        <ArrowRight class="daily-arrow" />
      </RouterLink>
    </section>

    <section class="page why-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Why Lingxige</p>
          <h2 class="section-title">为什么选择灵犀阁</h2>
          <p class="section-lead">把 AI 的结构化能力和东方文化体验结合起来，保持神秘感，也保持理性边界。</p>
        </div>
      </div>
      <div class="why-grid">
        <article v-for="item in whyItems" :key="item.title" class="why-card glass-card">
          <component :is="item.icon" class="why-icon" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="page narrow belief-section">
      <div class="belief-copy glass-panel gold-frame">
        <Sparkles class="belief-icon" />
        <p>{{ quote }}</p>
        <button class="quote-refresh" type="button" @click="refreshQuote">换一句</button>
      </div>
    </section>

    <footer class="home-footer">
      <RouterLink to="/privacy">隐私说明</RouterLink>
      <RouterLink to="/disclaimer">免责声明</RouterLink>
    </footer>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import ArrowRight from '@lucide/vue/dist/esm/icons/arrow-right.mjs'
import Compass from '@lucide/vue/dist/esm/icons/compass.mjs'
import Hand from '@lucide/vue/dist/esm/icons/hand.mjs'
import LockKeyhole from '@lucide/vue/dist/esm/icons/lock-keyhole.mjs'
import Scroll from '@lucide/vue/dist/esm/icons/scroll.mjs'
import ScanFace from '@lucide/vue/dist/esm/icons/scan-face.mjs'
import ScrollText from '@lucide/vue/dist/esm/icons/scroll-text.mjs'
import ShieldCheck from '@lucide/vue/dist/esm/icons/shield-check.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import X from '@lucide/vue/dist/esm/icons/x.mjs'
import FeatureCard from '../components/FeatureCard.vue'
import heroImage from '../assets/lingxi-hero.png'
import { getDailyQuote, getRandomQuote } from '../utils/quoteService'

const startDialogVisible = ref(false)
const quote = ref(getDailyQuote())
let previousBodyOverflow = ''

const features = [
  {
    title: '手相解读',
    description: '掌纹藏着你的天赋与人生轨迹',
    to: '/palm',
    icon: Hand,
    symbol: 'palm',
  },
  {
    title: '面相分析',
    description: '面部特征揭示性格与运势走向',
    to: '/face',
    icon: ScanFace,
    symbol: 'face',
  },
  {
    title: '生辰八字',
    description: '命理格局分析，把握人生节奏',
    to: '/bazi',
    icon: Compass,
    symbol: 'bazi',
  },
  {
    title: '塔罗牌占卜',
    description: '探索潜意识指引，寻找当下答案',
    to: '/tarot',
    icon: ScrollText,
    symbol: 'tarot',
  },
  {
    title: '今日灵签',
    description: '每日一次灵性指引，给你的温柔提醒',
    to: '/daily',
    icon: Scroll,
    symbol: 'daily',
  },
]

const trustItems = [
  {
    title: '四大测算体系',
    text: '手相 / 面相 / 八字 / 塔罗',
    icon: ShieldCheck,
  },
  {
    title: 'AI 智能解析',
    text: '深度分析 · 个性化解读',
    icon: Sparkles,
  },
  {
    title: '隐私安全保障',
    text: '数据加密 · 保护隐私',
    icon: LockKeyhole,
  },
]

const whyItems = [
  {
    title: '真实 AI 生成',
    text: '四类测算均由后端 AI 服务生成结构化报告，不做假数据展示。',
    icon: Sparkles,
  },
  {
    title: '隐私边界清晰',
    text: '图片仅用于本次分析，历史记录通过浏览器匿名标识区分。',
    icon: Compass,
  },
  {
    title: '报告层次完整',
    text: '基础结论、完整建议、深度追问与专属海报保持统一体验。',
    icon: ScrollText,
  },
  {
    title: '轻量文化体验',
    text: '不制造焦虑，不做绝对预测，只提供温和的自我探索参考。',
    icon: Scroll,
  },
]

function openStartDialog() {
  startDialogVisible.value = true
}

function closeStartDialog() {
  startDialogVisible.value = false
}

function refreshQuote() {
  quote.value = getRandomQuote(quote.value)
}

watch(startDialogVisible, (visible) => {
  if (visible) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
})
</script>

<style scoped>
.home {
  position: relative;
  overflow: hidden;
}

.hero {
  position: relative;
  min-height: calc(100vh - 76px);
  padding: 84px 0 58px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  border-bottom: 1px solid rgba(244, 210, 132, 0.16);
}

.hero::before,
.hero::after {
  position: absolute;
  pointer-events: none;
  content: "";
}

.hero::before {
  inset: 0;
  background:
    radial-gradient(circle at 78% 28%, rgba(245, 203, 115, 0.15), transparent 28%),
    radial-gradient(circle at 88% 72%, rgba(134, 71, 255, 0.2), transparent 32%),
    linear-gradient(180deg, transparent 0%, rgba(7, 5, 13, 0.86) 88%);
}

.hero::after {
  inset: auto 0 0;
  height: 180px;
  background: linear-gradient(180deg, transparent, rgba(7, 5, 13, 0.96));
}

.hero-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(420px, 0.86fr) minmax(520px, 1.14fr);
  gap: 44px;
  align-items: center;
  width: min(1320px, calc(100% - 72px));
  margin: 0 auto;
}

.hero-copy {
  padding: 26px 0 18px;
}

.hero-badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  margin: 0 0 28px;
  padding: 0 13px;
  color: var(--gold-light);
  font-weight: 900;
  border: 1px solid rgba(245, 203, 115, 0.32);
  border-radius: 999px;
  background:
    radial-gradient(circle at 20% 0%, rgba(245, 203, 115, 0.16), transparent 70%),
    rgba(255, 255, 255, 0.045);
  box-shadow: 0 0 30px rgba(245, 203, 115, 0.1);
}

.badge-icon {
  width: 16px;
  height: 16px;
}

h1 {
  display: grid;
  gap: 4px;
  max-width: 610px;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(56px, 5.4vw, 92px);
  line-height: 0.98;
  letter-spacing: var(--type-h1-letter-spacing);
}

h1 span {
  color: rgba(255, 250, 244, 0.92);
  font-weight: 700;
}

h1 strong {
  color: transparent;
  font-weight: 800;
  background: linear-gradient(135deg, #fff8d5 0%, #f5cb73 56%, #c59038 100%);
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow: 0 0 34px rgba(245, 203, 115, 0.14);
}

.hero-subtitle {
  max-width: 500px;
  margin: 30px 0 34px;
  color: rgba(247, 241, 255, 0.78);
  font-size: 20px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
}

.hero-button {
  min-width: 210px;
  min-height: 58px;
  padding: 0 30px;
  font-size: 17px;
  font-weight: 900;
  box-shadow:
    0 18px 46px rgba(245, 203, 115, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.hero-secondary {
  min-width: 188px;
  min-height: 58px;
  padding: 0 28px;
  font-size: 17px;
  font-weight: 900;
  background: rgba(5, 4, 12, 0.36);
}

.hero-trust {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  max-width: 710px;
  margin-top: 54px;
}

.trust-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: rgba(247, 241, 255, 0.74);
}

.trust-icon {
  width: 27px;
  height: 27px;
  color: var(--gold);
  filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.26));
  flex: 0 0 auto;
}

.trust-item strong {
  display: block;
  margin-bottom: 5px;
  color: var(--gold-light);
  font-size: 15px;
}

.trust-item small {
  display: block;
  color: rgba(247, 241, 255, 0.58);
  line-height: 1.45;
}

.hero-oracle {
  position: relative;
  display: grid;
  min-height: 520px;
  align-items: center;
}

.cosmic-plate {
  position: relative;
  width: min(660px, 52vw);
  aspect-ratio: 1;
  margin-left: auto;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(245, 203, 115, 0.18), transparent 8%),
    radial-gradient(circle at 50% 50%, rgba(245, 203, 115, 0.08), transparent 28%),
    radial-gradient(circle at 64% 35%, rgba(177, 139, 255, 0.12), transparent 34%),
    radial-gradient(circle at 35% 68%, rgba(245, 203, 115, 0.08), transparent 36%);
  filter: drop-shadow(0 0 46px rgba(245, 203, 115, 0.08));
}

.cosmic-plate::before,
.cosmic-plate::after {
  position: absolute;
  pointer-events: none;
  content: "";
}

.cosmic-plate::before {
  inset: 8%;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(245, 203, 115, 0.52) 0 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.42) 0 1px, transparent 1px),
    conic-gradient(from 0deg, transparent 0 7%, rgba(245, 203, 115, 0.28) 7.3% 7.8%, transparent 8.2% 23%, rgba(245, 203, 115, 0.22) 23.3% 23.8%, transparent 24.2% 100%);
  background-position:
    0 0,
    24px 36px,
    center;
  background-size:
    46px 46px,
    76px 76px,
    auto;
  opacity: 0.42;
  mask-image: radial-gradient(circle, transparent 0 18%, #000 19% 78%, transparent 79%);
}

.cosmic-plate::after {
  top: 50%;
  left: 4%;
  width: 92%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.28), rgba(255, 236, 188, 0.76), rgba(245, 203, 115, 0.28), transparent);
  box-shadow:
    0 0 18px rgba(245, 203, 115, 0.28),
    0 0 34px rgba(177, 139, 255, 0.16);
  transform: translateY(-50%);
  animation: core-scan 8s ease-in-out infinite;
}

.data-orbit {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgba(245, 203, 115, 0.2);
  border-radius: 50%;
  box-shadow:
    inset 0 0 44px rgba(245, 203, 115, 0.035),
    0 0 34px rgba(245, 203, 115, 0.05);
}

.data-orbit::before,
.data-orbit::after {
  position: absolute;
  width: 8px;
  height: 8px;
  content: "";
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 16px rgba(245, 203, 115, 0.75);
}

.data-orbit::before {
  top: 12%;
  left: 50%;
}

.data-orbit::after {
  right: 14%;
  bottom: 22%;
}

.data-orbit-one {
  inset: 0;
  border-color: rgba(245, 203, 115, 0.24);
  animation: orbit-slow 42s linear infinite;
}

.data-orbit-two {
  inset: 9%;
  border-color: rgba(245, 203, 115, 0.18);
  border-style: dashed;
  opacity: 0.82;
  animation: orbit-reverse 58s linear infinite;
}

.data-orbit-three {
  inset: 19%;
  border-color: rgba(245, 203, 115, 0.25);
  box-shadow:
    inset 0 0 36px rgba(245, 203, 115, 0.055),
    0 0 42px rgba(245, 203, 115, 0.08);
  animation: orbit-slow 36s linear infinite;
}

.data-orbit-four {
  inset: 29%;
  border-color: rgba(255, 246, 207, 0.18);
  opacity: 0.86;
  animation: orbit-reverse 30s linear infinite;
}

.scan-axis {
  position: absolute;
  pointer-events: none;
  opacity: 0.46;
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.58), transparent);
}

.scan-axis-vertical {
  inset: 2% 49.9%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(245, 203, 115, 0.48), transparent);
}

.scan-axis-horizontal {
  inset: 49.9% 2%;
  height: 1px;
}

.fate-core {
  position: absolute;
  inset: 36%;
  z-index: 3;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.core-halo,
.core-ring,
.core-crystal {
  position: absolute;
  display: block;
}

.core-halo {
  inset: -42%;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 238, 173, 0.28), transparent 30%),
    conic-gradient(from 0deg, transparent, rgba(245, 203, 115, 0.5), transparent 28%, rgba(177, 139, 255, 0.32), transparent 62%, rgba(245, 203, 115, 0.42), transparent);
  filter: blur(1px);
  opacity: 0.76;
  animation: core-breathe 4.8s ease-in-out infinite;
}

.core-ring {
  inset: -18%;
  border: 1px solid rgba(245, 203, 115, 0.58);
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 0 56%, rgba(245, 203, 115, 0.08) 57% 58%, transparent 59%),
    conic-gradient(from 45deg, rgba(245, 203, 115, 0.86), transparent 12%, rgba(255, 255, 255, 0.56), transparent 24%, rgba(245, 203, 115, 0.72), transparent 38%, rgba(177, 139, 255, 0.36), transparent 54%, rgba(245, 203, 115, 0.72), transparent 72%, rgba(255, 255, 255, 0.45), transparent);
  mask-image: radial-gradient(circle, transparent 0 61%, #000 62% 76%, transparent 77%);
  animation: orbit-slow 18s linear infinite;
}

.core-crystal {
  width: 70%;
  height: 70%;
  border: 1px solid rgba(255, 237, 177, 0.76);
  background:
    radial-gradient(circle at 50% 50%, #fff8d8 0 4%, rgba(245, 203, 115, 0.92) 5% 12%, transparent 13%),
    linear-gradient(135deg, rgba(255, 244, 194, 0.96), rgba(245, 203, 115, 0.16) 42%, rgba(177, 139, 255, 0.18) 64%, rgba(255, 244, 194, 0.72));
  clip-path: polygon(50% 0%, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0% 50%, 38% 36%);
  box-shadow:
    0 0 24px rgba(245, 203, 115, 0.75),
    0 0 72px rgba(245, 203, 115, 0.32),
    inset 0 0 18px rgba(255, 255, 255, 0.4);
  animation: core-breathe 3.8s ease-in-out infinite;
}

.core-caption {
  position: absolute;
  left: 50%;
  bottom: 17%;
  z-index: 4;
  display: grid;
  justify-items: center;
  gap: 4px;
  color: rgba(255, 240, 184, 0.84);
  font-family: var(--font-tech);
  text-transform: uppercase;
  transform: translateX(-50%);
  opacity: 0.66;
}

.core-caption span {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.core-caption small {
  color: rgba(247, 241, 255, 0.48);
  font-size: 10px;
  letter-spacing: 0.2em;
}

.data-node {
  position: absolute;
  z-index: 2;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff3be;
  box-shadow:
    0 0 12px rgba(245, 203, 115, 0.86),
    0 0 28px rgba(245, 203, 115, 0.28);
  animation: node-pulse 3.8s ease-in-out infinite;
}

.node-one {
  top: 21%;
  left: 33%;
}

.node-two {
  top: 35%;
  right: 20%;
  animation-delay: 0.8s;
}

.node-three {
  right: 34%;
  bottom: 18%;
  animation-delay: 1.4s;
}

.node-four {
  left: 20%;
  bottom: 33%;
  animation-delay: 2s;
}

.node-five {
  top: 11%;
  left: 52%;
  animation-delay: 2.6s;
}

.planet {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, #fff2b8, rgba(245, 203, 115, 0.72) 34%, rgba(124, 74, 34, 0.82) 100%),
    repeating-linear-gradient(45deg, transparent 0 6px, rgba(255, 255, 255, 0.08) 7px 8px);
  box-shadow: 0 0 28px rgba(245, 203, 115, 0.34);
  opacity: 0.88;
}

.planet-one {
  top: 9%;
  right: 16%;
  width: 54px;
  height: 54px;
}

.planet-two {
  left: 12%;
  bottom: 18%;
  width: 58px;
  height: 58px;
  opacity: 0.9;
}

.planet-three {
  right: 6%;
  top: 43%;
  width: 28px;
  height: 28px;
  opacity: 0.78;
}

@keyframes orbit-slow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit-reverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

@keyframes core-breathe {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.72;
  }

  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}

@keyframes core-scan {
  0%,
  100% {
    transform: translateY(-50%) translateX(-18px);
    opacity: 0.38;
  }

  50% {
    transform: translateY(-50%) translateX(18px);
    opacity: 0.86;
  }
}

@keyframes node-pulse {
  0%,
  100% {
    transform: scale(0.78);
    opacity: 0.42;
  }

  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

.oracle-card {
  position: absolute;
  right: 0;
  bottom: 42px;
  z-index: 3;
  display: flex;
  gap: 22px;
  align-items: center;
  justify-content: space-between;
  width: min(430px, 76%);
  padding: 26px 30px;
  border: 1px solid rgba(245, 203, 115, 0.5);
  border-radius: 8px;
  background:
    radial-gradient(circle at 82% 22%, rgba(245, 203, 115, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(80, 35, 94, 0.86), rgba(20, 13, 37, 0.9));
  box-shadow:
    0 22px 80px rgba(0, 0, 0, 0.42),
    0 0 34px rgba(245, 203, 115, 0.14);
  backdrop-filter: blur(14px);
}

.oracle-card small {
  font-family: var(--font-tech);
  color: var(--gold);
  font-size: 15px;
  font-weight: 900;
}

.oracle-card strong {
  display: block;
  margin: 9px 0 12px;
  font-family: var(--font-serif);
  font-size: 30px;
  letter-spacing: 0;
}

.oracle-card p {
  margin: 0;
  color: rgba(247, 241, 255, 0.78);
  line-height: 1.7;
}

.oracle-spark {
  width: 44px;
  height: 44px;
  color: var(--gold);
  filter: drop-shadow(0 0 18px rgba(245, 203, 115, 0.38));
  flex: 0 0 auto;
}

.hero-feature-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(5, 210px);
  gap: 14px;
  justify-content: center;
  width: min(1120px, calc(100% - 72px));
  margin: 34px auto 0;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--gold);
  font-weight: 900;
}

.start-modal-layer {
  position: fixed;
  inset: 0;
  z-index: 2800;
  display: grid;
  height: 100vh;
  height: 100dvh;
  padding: max(16px, env(safe-area-inset-top, 0px)) 16px max(16px, env(safe-area-inset-bottom, 0px));
  place-items: center;
}

.start-modal-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(5, 3, 10, 0.72);
  backdrop-filter: blur(8px);
}

.start-modal {
  position: relative;
  z-index: 1;
  width: min(820px, 100%);
  max-height: min(88vh, 760px);
  max-height: min(88dvh, 760px);
  padding: 24px;
  overflow-y: auto;
  border: 1px solid rgba(244, 210, 132, 0.28);
  border-radius: 8px;
  background:
    radial-gradient(circle at 72% 6%, rgba(244, 210, 132, 0.12), transparent 32%),
    radial-gradient(circle at 12% 20%, rgba(110, 203, 255, 0.1), transparent 30%),
    rgba(16, 9, 29, 0.98);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.62);
}

.start-modal-head {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.start-modal-head h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 28px;
}

.modal-close {
  display: grid;
  width: 40px;
  height: 40px;
  color: var(--text);
  cursor: pointer;
  border: 1px solid rgba(244, 210, 132, 0.24);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  place-items: center;
  flex: 0 0 auto;
}

.start-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.start-option {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  min-height: 124px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid rgba(244, 210, 132, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04)),
    rgba(12, 8, 22, 0.72);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.start-option:hover {
  border-color: rgba(244, 210, 132, 0.42);
  box-shadow: 0 22px 62px rgba(0, 0, 0, 0.38);
  transform: translateY(-2px);
}

.start-option-icon {
  display: grid;
  width: 50px;
  height: 50px;
  color: var(--gold);
  border: 1px solid rgba(244, 210, 132, 0.28);
  border-radius: 8px;
  background: rgba(244, 210, 132, 0.08);
  place-items: center;
}

.start-option strong {
  display: block;
  margin-bottom: 7px;
  color: var(--text);
  font-size: 19px;
}

.start-option small {
  display: block;
  color: var(--muted);
  line-height: 1.65;
}

.start-option-arrow {
  width: 18px;
  height: 18px;
  color: rgba(244, 210, 132, 0.68);
}

.start-modal-enter-active,
.start-modal-leave-active {
  transition: opacity 0.18s ease;
}

.start-modal-enter-active .start-modal,
.start-modal-leave-active .start-modal {
  transition: transform 0.18s ease;
}

.start-modal-enter-from,
.start-modal-leave-to {
  opacity: 0;
}

.start-modal-enter-from .start-modal,
.start-modal-leave-to .start-modal {
  transform: translateY(12px) scale(0.98);
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.daily-entry-section {
  padding-top: 56px;
}

.daily-entry {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  padding: 30px;
  overflow: hidden;
  border-radius: 8px;
}

.daily-entry::after {
  position: absolute;
  right: 28px;
  top: 50%;
  width: 260px;
  height: 260px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.1);
  border-radius: 50%;
  transform: translateY(-50%);
}

.daily-slip {
  display: grid;
  width: 188px;
  min-height: 246px;
  padding: 24px 18px;
  place-items: center;
  text-align: center;
  color: #201403;
  border-radius: 8px;
  background: linear-gradient(145deg, #fff3be, var(--gold) 48%, #b98b3e);
  box-shadow: 0 24px 70px rgba(245, 203, 115, 0.18);
}

.daily-icon {
  width: 36px;
  height: 36px;
}

.daily-slip strong {
  font-family: var(--font-serif);
  font-size: 24px;
}

.daily-slip small {
  font-weight: 800;
  line-height: 1.6;
}

.daily-entry-copy h2 {
  margin: 0 0 12px;
  font-family: var(--font-serif);
  font-size: 30px;
}

.daily-entry-copy p:last-child {
  max-width: 660px;
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}

.daily-arrow {
  width: 24px;
  height: 24px;
  color: var(--gold);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.why-card {
  min-height: 210px;
  padding: 22px;
  border-radius: 8px;
}

.why-icon {
  width: 28px;
  height: 28px;
  color: var(--gold);
}

.why-card h3 {
  margin: 18px 0 10px;
}

.why-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

.belief-section {
  padding-top: 8px;
}

.belief-copy {
  display: grid;
  min-height: 210px;
  padding: 34px;
  place-items: center;
  text-align: center;
  border-radius: 8px;
}

.belief-copy p {
  max-width: 720px;
  margin: 12px 0 0;
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.7;
}

.quote-refresh {
  height: 34px;
  margin-top: 18px;
  padding: 0 16px;
  color: var(--gold);
  font-size: 14px;
  border: 1px solid rgba(244, 210, 132, 0.38);
  border-radius: 999px;
  background: rgba(244, 210, 132, 0.06);
  box-shadow: 0 0 18px rgba(244, 210, 132, 0.08);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.quote-refresh:hover {
  border-color: rgba(244, 210, 132, 0.72);
  background: rgba(244, 210, 132, 0.12);
  transform: translateY(-1px);
}

.belief-icon {
  width: 28px;
  height: 28px;
  color: var(--gold);
}

.home-footer {
  display: flex;
  gap: 18px;
  justify-content: center;
  padding: 0 20px 44px;
  color: var(--muted);
}

.home-footer a:hover {
  color: var(--gold);
}

@media (max-width: 1180px) {
  .hero-shell {
    grid-template-columns: 1fr;
  }

  .hero-oracle {
    min-height: 440px;
  }

  .cosmic-plate {
    width: min(560px, 82vw);
    margin: 0 auto;
  }

  .oracle-card {
    right: 50%;
    transform: translateX(50%);
  }

  .hero-feature-grid {
    grid-template-columns: repeat(3, minmax(188px, 210px));
  }
}

@media (max-width: 900px) {
  .hero {
    padding: 58px 0 44px;
  }

  .hero-shell,
  .hero-feature-grid {
    width: min(100% - 28px, 720px);
  }

  .hero-trust {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 34px;
  }

  .hero-feature-grid {
    grid-template-columns: repeat(2, minmax(0, 210px));
  }

  .why-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 620px) {
  .hero {
    min-height: auto;
    padding: 36px 0 34px;
    background-position: 60% center;
  }

  .hero-shell {
    gap: 28px;
  }

  h1 {
    max-width: 330px;
    font-size: 44px;
    line-height: 1.04;
  }

  .hero-badge {
    margin-bottom: 22px;
    font-size: 13px;
  }

  .hero-subtitle {
    max-width: 330px;
    margin: 22px 0 28px;
    font-size: 16px;
    line-height: 1.72;
  }

  .hero-actions,
  .hero-button,
  .hero-secondary {
    width: 100%;
  }

  .hero-button,
  .hero-secondary {
    min-height: 50px;
  }

  .hero-oracle {
    min-height: 360px;
  }

  .cosmic-plate {
    width: min(360px, 92vw);
  }

  .oracle-card {
    bottom: 12px;
    width: min(330px, 94%);
    padding: 18px;
  }

  .oracle-card strong {
    font-size: 22px;
  }

  .oracle-spark {
    width: 32px;
    height: 32px;
  }

  .hero-feature-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 22px;
  }

  .daily-entry {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 20px;
  }

  .daily-slip {
    width: 100%;
    min-height: 180px;
  }

  .daily-entry-copy h2 {
    font-size: 23px;
  }

  .daily-arrow,
  .daily-entry::after {
    display: none;
  }

  .why-grid {
    grid-template-columns: 1fr;
  }

  .start-modal-layer {
    align-items: end;
    padding: max(10px, env(safe-area-inset-top, 0px)) 10px max(10px, env(safe-area-inset-bottom, 0px));
  }

  .start-modal {
    width: 100%;
    max-height: calc(100vh - 20px);
    max-height: calc(100dvh - 20px);
    padding: 18px;
  }

  .start-modal-head h2 {
    font-size: 23px;
  }

  .start-option-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .start-option {
    min-height: 104px;
    padding: 15px;
  }

  .start-option-icon {
    width: 44px;
    height: 44px;
  }

  .start-option strong {
    font-size: 17px;
  }

  .belief-copy p {
    font-size: 18px;
    line-height: 1.65;
  }

  .quote-refresh {
    height: 32px;
    margin-top: 14px;
    padding: 0 14px;
    font-size: 13px;
  }

  .section-heading {
    align-items: flex-start;
  }
}

@media (max-width: 380px) {
  h1 {
    font-size: 39px;
  }
}
</style>
