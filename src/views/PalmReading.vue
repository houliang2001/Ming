<template>
  <section class="page palm-page">
    <div class="palm-layout">
      <section class="palm-panel palm-control">
        <div class="palm-title-block">
          <p class="palm-kicker">Palm Reading</p>
          <h1>手相测算</h1>
          <p>请上传清晰、光线均匀、手掌完全展开的照片，AI 将解析你的掌纹结构与趋势信息。</p>
        </div>

        <div class="palm-step-line" aria-label="手相测算流程">
          <div v-for="(step, index) in steps" :key="step" :class="['palm-step', { active: index === 0 }]">
            <b>{{ index + 1 }}</b>
            <span>{{ step }}</span>
          </div>
        </div>

        <section class="hand-choice-block">
          <h2>
            <Sparkles class="section-icon" />
            选择手掌
          </h2>
          <div class="hand-choice-grid">
            <button
              v-for="item in handOptions"
              :key="item.value"
              :class="['hand-choice-card', { active: hand === item.value }]"
              type="button"
              @click="hand = item.value"
            >
              <Hand class="hand-choice-icon" />
              <strong>{{ item.label }}</strong>
              <small>{{ item.hint }}</small>
              <CircleCheck class="choice-check" />
            </button>
          </div>
        </section>

        <section class="palm-upload-block">
          <h2>
            <Sparkles class="section-icon" />
            上传手掌照片
          </h2>
          <input
            ref="inputRef"
            class="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="handleFile"
          />
          <button class="palm-upload-card" type="button" @click="openPicker">
            <template v-if="photo?.preview">
              <img :src="photo.preview" alt="手掌照片预览" />
              <span class="upload-change">点击重新上传</span>
            </template>
            <template v-else>
              <span class="upload-aura">
                <UploadCloud class="upload-icon" />
              </span>
              <strong>点击上传手掌照片</strong>
              <small>请上传清晰、无遮挡、光线充足的手掌照片</small>
              <em>支持 JPG / PNG / WEBP 格式，建议大小 2MB 以内</em>
            </template>
          </button>
        </section>

        <section class="report-style-block">
          <h2>
            <Sparkles class="section-icon" />
            报告风格
          </h2>
          <div class="palm-style-grid">
            <button
              v-for="style in styleOptions"
              :key="style.value"
              :class="['palm-style-card', { active: reportStyle === style.value }]"
              type="button"
              @click="reportStyle = style.value"
            >
              <component :is="style.icon" class="style-icon" />
              <strong>{{ style.value }}</strong>
              <small>{{ style.hint }}</small>
              <CircleCheck class="style-check" />
            </button>
          </div>
        </section>

        <button
          class="palm-analyze-button"
          type="button"
          :disabled="loading"
          @click="startAnalyze"
        >
          <Sparkles class="button-icon" />
          {{ loading ? '正在解析掌纹结构……' : '开始分析' }}
        </button>

        <p class="privacy-note">
          <ShieldCheck class="privacy-icon" />
          我们将严格保护你的隐私信息
        </p>
      </section>

      <aside class="palm-panel palm-scan-panel">
        <header class="scan-title">
          <Sparkles class="section-icon" />
          <h2>AI 手相扫描预览</h2>
        </header>

        <div class="palm-scan-stage" :class="{ uploaded: photo?.preview, scanning: loading }">
          <span class="scan-corner corner-top-left"></span>
          <span class="scan-corner corner-top-right"></span>
          <span class="scan-corner corner-bottom-left"></span>
          <span class="scan-corner corner-bottom-right"></span>

          <div class="scan-orbit" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="scan-particles" aria-hidden="true">
            <span v-for="index in 10" :key="index"></span>
          </div>
          <i class="scan-beam"></i>

          <div class="palm-subject">
            <img v-if="photo?.preview" :src="photo.preview" alt="手掌扫描预览" />
            <svg v-else class="palm-outline" viewBox="0 0 220 260" aria-hidden="true">
              <path d="M111 219c-43 0-76-31-76-74v-48c0-8 6-14 14-14s14 6 14 14v33" />
              <path d="M63 131V47c0-9 7-16 16-16s16 7 16 16v79" />
              <path d="M95 123V28c0-9 7-16 16-16s16 7 16 16v94" />
              <path d="M127 122V42c0-9 7-16 16-16s16 7 16 16v91" />
              <path d="M159 137V73c0-9 7-16 16-16s16 7 16 16v88" />
              <path d="M189 154l14-17c6-7 16-8 22-2 6 5 7 15 2 21l-32 39c-18 17-44 24-84 24" />
              <path class="palm-line" d="M65 164c27-19 62-18 90 2" />
              <path class="palm-line" d="M73 190c23-12 50-12 73 1" />
              <path class="palm-line" d="M83 145c24 5 42 0 57-19" />
              <path class="palm-line" d="M64 116h96" />
            </svg>
          </div>

          <div class="scan-copy">
            <h2>{{ loading ? '正在分析掌纹结构……' : photo?.preview ? '手掌照片已上传' : '等待上传手掌照片' }}</h2>
            <p>{{ loading ? 'AI 正在读取掌纹结构与趋势线索，请稍候' : photo?.preview ? '点击开始分析，AI 将识别掌纹结构与趋势信息' : '请上传清晰、无遮挡、光线充足的手掌照片' }}</p>
            <ul v-if="loading" class="scan-status-list" aria-label="AI 扫描状态">
              <li v-for="item in scanStatusSteps" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="scan-info-list">
          <article v-for="item in scanInfo" :key="item.title">
            <span class="scan-info-icon">
              <component :is="item.icon" />
            </span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.text }}</small>
          </article>
        </div>
      </aside>
    </div>

    <p class="page-disclaimer">本报告由 AI 生成，仅供娱乐、文化体验与自我探索参考，不作为任何决策依据。</p>

    <LoadingAnalyze
      :active="loading"
      title="正在分析手相"
      :messages="[
        '正在识别掌纹结构……',
        '正在分析生命线、智慧线与感情线……',
        '正在生成你的专属手相报告……',
      ]"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import BriefcaseBusiness from '@lucide/vue/dist/esm/icons/briefcase-business.mjs'
import CircleCheck from '@lucide/vue/dist/esm/icons/circle-check.mjs'
import Hand from '@lucide/vue/dist/esm/icons/hand.mjs'
import Heart from '@lucide/vue/dist/esm/icons/heart.mjs'
import ScanLine from '@lucide/vue/dist/esm/icons/scan-line.mjs'
import ShieldCheck from '@lucide/vue/dist/esm/icons/shield-check.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import UploadCloud from '@lucide/vue/dist/esm/icons/cloud-upload.mjs'
import LoadingAnalyze from '../components/LoadingAnalyze.vue'
import { AiServiceError, analyzePalmImage } from '../utils/aiService'
import { saveReport } from '../utils/storage'

const router = useRouter()
const inputRef = ref(null)
const hand = ref('left')
const photo = ref(null)
const loading = ref(false)
const reportStyle = ref('温和指引')

const steps = ['选择手掌', '上传照片', 'AI识别', '生成报告']
const scanStatusSteps = ['正在读取手掌图像……', '正在识别掌纹结构……', '正在生成趋势解读……']
const handOptions = [
  { label: '左手', value: 'left', hint: '先天禀赋与内在特质' },
  { label: '右手', value: 'right', hint: '后天发展与未来趋势' },
]
const styleOptions = [
  { value: '温和指引', hint: '温柔建议 · 平衡指引', icon: Sparkles },
  { value: '事业重点', hint: '事业发展 · 职场分析', icon: BriefcaseBusiness },
  { value: '感情重点', hint: '情感关系 · 相处建议', icon: Heart },
]
const scanInfo = [
  {
    title: 'AI 手纹识别',
    text: '多维度纹路识别与智能分析',
    icon: ScanLine,
  },
  {
    title: '隐私保护',
    text: '不保存原始图片，分析后立即删除',
    icon: ShieldCheck,
  },
  {
    title: '体验说明',
    text: '结果仅供娱乐与自我探索参考',
    icon: Sparkles,
  },
]

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function openPicker() {
  if (inputRef.value) {
    inputRef.value.value = ''
    inputRef.value.click()
  }
}

function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    photo.value = {
      file,
      preview: reader.result,
      name: file.name,
    }
  }
  reader.readAsDataURL(file)
}

function resolvePalmError(error) {
  if (error instanceof AiServiceError) {
    if (error.code === 'INVALID_IMAGE' || error.status === 400) {
      return error.message || 'AI分析服务暂时不可用，请稍后重试'
    }
  }

  return 'AI分析服务暂时不可用，请稍后重试'
}

async function startAnalyze() {
  if (!photo.value?.file) {
    ElMessage.warning('请先上传手掌照片')
    return
  }

  loading.value = true
  const startedAt = Date.now()

  try {
    const report = await analyzePalmImage(photo.value.file, hand.value === 'left' ? '左手' : '右手', reportStyle.value)
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    saveReport(report)
    router.push({ name: 'result', params: { id: report.id } })
  } catch (error) {
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    ElMessage.error(resolvePalmError(error))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.palm-page {
  position: relative;
  width: min(1320px, calc(100% - 56px));
  padding-top: 30px;
  isolation: isolate;
}

.palm-page::before,
.palm-page::after {
  position: fixed;
  inset: 76px 0 0;
  z-index: -1;
  pointer-events: none;
  content: "";
}

.palm-page::before {
  background:
    radial-gradient(circle at 52% 32%, rgba(245, 203, 115, 0.12), transparent 26%),
    radial-gradient(circle at 50% 46%, rgba(132, 72, 255, 0.2), transparent 44%),
    linear-gradient(180deg, #070713 0%, #13091f 52%, #050711 100%);
}

.palm-page::after {
  opacity: 0.27;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.55) 0 1px, transparent 1px),
    radial-gradient(circle, rgba(245, 203, 115, 0.5) 0 1px, transparent 1px),
    radial-gradient(circle at 4% 54%, transparent 0 142px, rgba(245, 203, 115, 0.08) 143px 144px, transparent 145px),
    radial-gradient(circle at 96% 54%, transparent 0 142px, rgba(245, 203, 115, 0.08) 143px 144px, transparent 145px),
    linear-gradient(105deg, transparent 0 14%, rgba(245, 203, 115, 0.06) 14.2%, transparent 14.5% 86%, rgba(245, 203, 115, 0.055) 86.2%, transparent 86.5%);
  background-position:
    0 0,
    48px 70px,
    left center,
    right center,
    center;
  background-size:
    122px 122px,
    184px 184px,
    auto,
    auto,
    auto;
}

.palm-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
  gap: 28px;
  align-items: stretch;
}

.palm-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(245, 203, 115, 0.25);
  border-radius: 24px;
  background:
    radial-gradient(circle at 12% 8%, rgba(245, 203, 115, 0.11), transparent 28%),
    radial-gradient(circle at 82% 10%, rgba(190, 98, 255, 0.13), transparent 30%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.095), rgba(255, 255, 255, 0.028)),
    rgba(14, 9, 26, 0.88);
  box-shadow:
    0 28px 82px rgba(0, 0, 0, 0.42),
    inset 0 0 60px rgba(245, 203, 115, 0.03);
  backdrop-filter: blur(18px);
}

.palm-panel::before {
  position: absolute;
  inset: 10px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.12);
  border-radius: 18px;
}

.palm-control {
  padding: 34px 30px 24px;
}

.palm-title-block,
.hand-choice-block,
.palm-upload-block,
.report-style-block,
.privacy-note,
.palm-analyze-button {
  position: relative;
  z-index: 1;
}

.palm-kicker {
  margin: 0 0 12px;
  color: var(--gold);
  font-family: var(--font-tech);
  font-size: 17px;
  font-weight: 800;
}

.palm-title-block h1 {
  margin: 0;
  color: #fff5df;
  font-family: var(--font-serif);
  font-size: clamp(48px, 4.8vw, 66px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: 2px;
  text-shadow: 0 0 26px rgba(245, 203, 115, 0.18);
}

.palm-title-block p:last-child {
  max-width: 610px;
  margin: 16px 0 0;
  color: rgba(246, 240, 255, 0.72);
  font-size: 16px;
  line-height: 1.85;
}

.palm-step-line {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin: 28px 0 22px;
}

.palm-step-line::before {
  position: absolute;
  top: 24px;
  right: 7%;
  left: 7%;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.36), transparent);
}

.palm-step {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  justify-items: center;
  color: rgba(246, 240, 255, 0.55);
  font-weight: 700;
}

.palm-step b {
  display: grid;
  width: 48px;
  height: 48px;
  color: rgba(246, 240, 255, 0.72);
  font-size: 20px;
  border: 1px solid rgba(245, 203, 115, 0.34);
  border-radius: 50%;
  background: rgba(9, 6, 18, 0.9);
  place-items: center;
}

.palm-step.active {
  color: #fff0b8;
}

.palm-step.active b {
  color: #201407;
  border-color: rgba(245, 203, 115, 0.88);
  background: linear-gradient(135deg, #fff0b8, #f5cb73 58%, #b98b3e);
  box-shadow:
    0 0 0 6px rgba(245, 203, 115, 0.08),
    0 0 26px rgba(245, 203, 115, 0.28);
}

.hand-choice-block h2,
.palm-upload-block h2,
.report-style-block h2,
.scan-title {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  margin: 0 0 14px;
  color: #fff0b8;
  font-size: 18px;
  font-weight: 800;
}

.section-icon {
  width: 17px;
  height: 17px;
  color: var(--gold);
  filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.26));
}

.hand-choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hand-choice-card,
.palm-style-card {
  position: relative;
  display: grid;
  color: rgba(246, 240, 255, 0.68);
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.18);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(255, 255, 255, 0.035);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.hand-choice-card {
  grid-template-columns: auto minmax(0, 1fr);
  gap: 5px 14px;
  min-height: 96px;
  padding: 18px 20px;
  text-align: left;
  border-radius: 16px;
}

.hand-choice-card:hover,
.hand-choice-card.active,
.palm-style-card:hover,
.palm-style-card.active {
  border-color: rgba(245, 203, 115, 0.72);
  background:
    radial-gradient(circle at 12% 0%, rgba(245, 203, 115, 0.18), transparent 60%),
    rgba(245, 203, 115, 0.07);
  box-shadow: 0 0 26px rgba(245, 203, 115, 0.12);
  transform: translateY(-1px);
}

.hand-choice-icon {
  grid-row: span 2;
  width: 42px;
  height: 42px;
  padding: 6px;
  color: var(--gold);
  border-radius: 50%;
}

.hand-choice-card strong,
.palm-style-card strong {
  color: #fff0b8;
  font-size: 17px;
}

.hand-choice-card small,
.palm-style-card small {
  color: rgba(246, 240, 255, 0.54);
  font-size: 12px;
  line-height: 1.5;
}

.choice-check,
.style-check {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 18px;
  height: 18px;
  color: #201407;
  opacity: 0;
  border-radius: 50%;
  background: var(--gold);
  transform: scale(0.7);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.hand-choice-card.active .choice-check,
.palm-style-card.active .style-check {
  opacity: 1;
  transform: scale(1);
}

.palm-upload-block {
  margin-top: 24px;
}

.file-input {
  display: none;
}

.palm-upload-card {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 214px;
  padding: 28px;
  overflow: hidden;
  color: var(--text);
  cursor: pointer;
  border: 1px dashed rgba(245, 203, 115, 0.48);
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 46%, rgba(245, 203, 115, 0.13), transparent 23%),
    radial-gradient(circle at 50% 50%, rgba(137, 78, 255, 0.12), transparent 42%),
    linear-gradient(90deg, transparent 0 44%, rgba(245, 203, 115, 0.08) 50%, transparent 56%),
    rgba(255, 255, 255, 0.035);
  box-shadow:
    inset 0 0 38px rgba(245, 203, 115, 0.025),
    0 18px 54px rgba(0, 0, 0, 0.22);
  place-items: center;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.palm-upload-card::before,
.palm-upload-card::after {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  content: "";
  border-top: 1px solid rgba(245, 203, 115, 0.18);
  border-bottom: 1px solid rgba(245, 203, 115, 0.18);
}

.palm-upload-card::after {
  inset: 18px;
  border-top: 0;
  border-bottom: 0;
  border-left: 1px solid rgba(245, 203, 115, 0.12);
  border-right: 1px solid rgba(245, 203, 115, 0.12);
}

.palm-upload-card:hover {
  border-color: rgba(245, 203, 115, 0.78);
  box-shadow:
    inset 0 0 42px rgba(245, 203, 115, 0.04),
    0 22px 66px rgba(0, 0, 0, 0.32),
    0 0 30px rgba(245, 203, 115, 0.08);
  transform: translateY(-1px);
}

.upload-aura {
  display: grid;
  width: 82px;
  height: 82px;
  margin-bottom: 14px;
  color: var(--gold);
  border: 1px solid rgba(245, 203, 115, 0.32);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(245, 203, 115, 0.16), transparent 58%),
    rgba(245, 203, 115, 0.045);
  box-shadow:
    inset 0 0 26px rgba(245, 203, 115, 0.06),
    0 0 34px rgba(245, 203, 115, 0.14);
  place-items: center;
}

.upload-icon {
  width: 38px;
  height: 38px;
}

.palm-upload-card strong {
  color: #fff0b8;
  font-size: 19px;
}

.palm-upload-card small {
  margin-top: 10px;
  color: rgba(246, 240, 255, 0.72);
  font-size: 14px;
}

.palm-upload-card em {
  margin-top: 8px;
  color: rgba(246, 240, 255, 0.46);
  font-size: 12px;
  font-style: normal;
}

.palm-upload-card img {
  width: 100%;
  height: 228px;
  object-fit: cover;
  border-radius: 15px;
}

.upload-change {
  position: absolute;
  right: 24px;
  bottom: 22px;
  padding: 8px 13px;
  color: #201407;
  font-weight: 800;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff0b8, #f5cb73);
}

.report-style-block {
  margin-top: 24px;
}

.palm-style-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.palm-style-card {
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 11px;
  min-height: 88px;
  padding: 15px;
  text-align: left;
  border-radius: 16px;
}

.style-icon {
  grid-row: span 2;
  width: 34px;
  height: 34px;
  padding: 7px;
  color: var(--gold);
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: 50%;
  background: rgba(245, 203, 115, 0.07);
}

.palm-analyze-button {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 58px;
  margin-top: 26px;
  color: #201407;
  font-size: 19px;
  font-weight: 900;
  border: 0;
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42), transparent 30%),
    linear-gradient(135deg, #fff0b8, #f5c76a 52%, #c99634);
  box-shadow:
    0 18px 44px rgba(245, 203, 115, 0.23),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.palm-analyze-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 22px 56px rgba(245, 203, 115, 0.32),
    0 0 32px rgba(245, 203, 115, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.palm-analyze-button:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
}

.privacy-note {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin: 14px 0 0;
  color: rgba(246, 240, 255, 0.58);
  font-size: 13px;
}

.privacy-icon {
  width: 16px;
  height: 16px;
  color: var(--gold);
}

.palm-scan-panel {
  display: grid;
  gap: 18px;
  padding: 34px 30px;
  align-content: start;
}

.scan-title {
  position: relative;
  z-index: 1;
  margin-bottom: 4px;
}

.scan-title h2 {
  margin: 0;
  color: #fff5df;
  font-size: 20px;
}

.palm-scan-stage {
  --scan-travel: 360px;
  position: relative;
  display: grid;
  min-height: 540px;
  overflow: hidden;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 42%, rgba(245, 203, 115, 0.12), transparent 28%),
    radial-gradient(circle at 50% 46%, rgba(165, 88, 255, 0.18), transparent 42%),
    rgba(255, 255, 255, 0.025);
  box-shadow: inset 0 0 42px rgba(245, 203, 115, 0.02);
  isolation: isolate;
  place-items: center;
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background 0.24s ease;
}

.palm-scan-stage::before {
  position: absolute;
  inset: 18px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.08);
  border-radius: 18px;
}

.palm-scan-stage::after {
  position: absolute;
  top: 12%;
  right: 8%;
  left: 8%;
  z-index: 1;
  height: 110px;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(180deg, rgba(116, 218, 255, 0.08), rgba(245, 203, 115, 0.08), transparent),
    radial-gradient(ellipse at 50% 45%, rgba(245, 203, 115, 0.12), transparent 62%);
  filter: blur(10px);
  opacity: 0.22;
  transform: translateY(0);
  animation: scan-zone-light 3.6s ease-in-out infinite;
}

.palm-scan-stage.uploaded {
  border-color: rgba(245, 203, 115, 0.24);
  box-shadow:
    inset 0 0 48px rgba(245, 203, 115, 0.04),
    0 0 26px rgba(245, 203, 115, 0.06);
}

.palm-scan-stage.scanning {
  border-color: rgba(120, 210, 255, 0.34);
  background:
    radial-gradient(circle at 50% 42%, rgba(120, 210, 255, 0.12), transparent 24%),
    radial-gradient(circle at 50% 42%, rgba(245, 203, 115, 0.16), transparent 32%),
    radial-gradient(circle at 50% 46%, rgba(165, 88, 255, 0.2), transparent 44%),
    rgba(255, 255, 255, 0.03);
  box-shadow:
    inset 0 0 58px rgba(120, 210, 255, 0.04),
    inset 0 0 76px rgba(245, 203, 115, 0.05),
    0 0 34px rgba(120, 210, 255, 0.08);
}

.palm-scan-stage.scanning::after {
  opacity: 0.46;
  animation-duration: 2.4s;
}

.scan-orbit,
.scan-orbit span {
  position: absolute;
  border-radius: 50%;
}

.scan-orbit {
  top: 48%;
  left: 50%;
  width: 430px;
  height: 430px;
  border: 1px solid rgba(245, 203, 115, 0.2);
  transform: translate(-50%, -55%);
  animation: ringRotate 22s linear infinite;
  will-change: transform;
}

.scan-orbit span {
  inset: 42px;
  border: 1px solid rgba(245, 203, 115, 0.14);
  animation: ringRotateInner 28s linear infinite reverse;
  will-change: transform;
}

.scan-orbit span:nth-child(2) {
  inset: 86px;
  border-style: dashed;
  border-color: rgba(245, 203, 115, 0.24);
  animation-duration: 34s;
}

.scan-orbit span:nth-child(3) {
  inset: 132px;
  border-color: rgba(245, 203, 115, 0.18);
  box-shadow: inset 0 0 34px rgba(245, 203, 115, 0.04);
  animation-duration: 42s;
  animation-direction: normal;
}

.palm-scan-stage.scanning .scan-orbit {
  border-color: rgba(120, 210, 255, 0.22);
  animation-duration: 14s;
}

.palm-scan-stage.scanning .scan-orbit span {
  border-color: rgba(245, 203, 115, 0.28);
}

.scan-beam {
  position: absolute;
  top: 12%;
  left: 8%;
  z-index: 4;
  width: 84%;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(115, 220, 255, 0.9), rgba(245, 203, 115, 0.75), transparent);
  box-shadow:
    0 0 14px rgba(120, 210, 255, 0.28),
    0 0 24px rgba(245, 203, 115, 0.26);
  opacity: 0.58;
  animation: scanLineMove 3.6s ease-in-out infinite;
  will-change: transform, opacity;
}

.scan-beam::after {
  position: absolute;
  top: -38px;
  right: 8%;
  left: 8%;
  height: 76px;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(180deg, transparent, rgba(120, 210, 255, 0.08), rgba(245, 203, 115, 0.1), transparent),
    radial-gradient(ellipse at 50% 50%, rgba(245, 203, 115, 0.12), transparent 62%);
  filter: blur(5px);
}

.palm-scan-stage.scanning .scan-beam {
  height: 4px;
  box-shadow:
    0 0 16px rgba(120, 210, 255, 0.42),
    0 0 30px rgba(245, 203, 115, 0.36);
  opacity: 0.95;
  animation-duration: 2.4s;
}

.scan-corner {
  position: absolute;
  z-index: 5;
  width: 48px;
  height: 48px;
  border-color: rgba(255, 225, 140, 0.92);
  filter: drop-shadow(0 0 10px rgba(245, 203, 115, 0.3));
  animation: cornerPulse 2.8s ease-in-out infinite;
}

.corner-top-right {
  animation-delay: 0.2s;
}

.corner-bottom-right {
  animation-delay: 0.4s;
}

.corner-bottom-left {
  animation-delay: 0.6s;
}

.palm-scan-stage.scanning .scan-corner {
  animation-duration: 1.8s;
}

.corner-top-left {
  top: 42px;
  left: 42px;
  border-top: 3px solid;
  border-left: 3px solid;
  border-radius: 14px 0 0;
}

.corner-top-right {
  top: 42px;
  right: 42px;
  border-top: 3px solid;
  border-right: 3px solid;
  border-radius: 0 14px 0 0;
}

.corner-bottom-left {
  bottom: 116px;
  left: 42px;
  border-bottom: 3px solid;
  border-left: 3px solid;
  border-radius: 0 0 0 14px;
}

.corner-bottom-right {
  right: 42px;
  bottom: 116px;
  border-right: 3px solid;
  border-bottom: 3px solid;
  border-radius: 0 0 14px;
}

.palm-subject {
  position: relative;
  z-index: 2;
  display: grid;
  width: min(320px, 72%);
  height: min(360px, 70%);
  place-items: center;
}

.palm-subject img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid rgba(245, 203, 115, 0.3);
  border-radius: 22px;
  box-shadow: 0 0 38px rgba(245, 203, 115, 0.12);
  animation: palmImagePulse 4.2s ease-in-out infinite;
  transition:
    filter 0.24s ease,
    box-shadow 0.24s ease;
}

.palm-scan-stage.scanning .palm-subject img {
  filter: brightness(1.08) contrast(1.04) saturate(1.06);
  box-shadow:
    0 0 42px rgba(120, 210, 255, 0.15),
    0 0 58px rgba(245, 203, 115, 0.14);
  animation-duration: 2.8s;
}

.palm-outline {
  width: min(280px, 90%);
  color: var(--gold);
  fill: none;
  stroke: currentColor;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter:
    drop-shadow(0 0 8px rgba(245, 203, 115, 0.9))
    drop-shadow(0 0 24px rgba(245, 203, 115, 0.45));
  animation: palmGlowPulse 4.2s ease-in-out infinite;
  transform-origin: center;
  will-change: filter, opacity, transform;
}

.palm-scan-stage.scanning .palm-outline {
  animation-duration: 2.6s;
}

.palm-line {
  stroke-width: 2.5;
  opacity: 0.72;
}

.scan-copy {
  position: relative;
  z-index: 4;
  margin-top: -80px;
}

.palm-scan-stage.uploaded .scan-copy {
  margin-top: -56px;
}

.scan-copy h2 {
  margin: 0 0 12px;
  color: var(--gold);
  font-family: var(--font-serif);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 22px rgba(245, 203, 115, 0.22);
}

.scan-copy p {
  margin: 0;
  color: rgba(246, 240, 255, 0.7);
  font-size: 15px;
}

.scan-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.scan-particles span {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(245, 203, 115, 0.68);
  box-shadow:
    0 0 10px rgba(245, 203, 115, 0.4),
    0 0 18px rgba(120, 210, 255, 0.14);
  opacity: 0.42;
  animation: particleFloat 7s ease-in-out infinite;
  will-change: transform, opacity;
}

.scan-particles span:nth-child(1) {
  top: 17%;
  left: 19%;
}

.scan-particles span:nth-child(2) {
  top: 26%;
  right: 18%;
  width: 3px;
  height: 3px;
  animation-delay: -1.4s;
}

.scan-particles span:nth-child(3) {
  top: 42%;
  left: 13%;
  background: rgba(120, 210, 255, 0.62);
  animation-delay: -2.2s;
}

.scan-particles span:nth-child(4) {
  top: 45%;
  right: 13%;
  width: 5px;
  height: 5px;
  animation-delay: -3.3s;
}

.scan-particles span:nth-child(5) {
  top: 63%;
  left: 22%;
  animation-delay: -4.1s;
}

.scan-particles span:nth-child(6) {
  top: 67%;
  right: 24%;
  background: rgba(190, 142, 255, 0.56);
  animation-delay: -0.8s;
}

.scan-particles span:nth-child(7) {
  top: 31%;
  left: 45%;
  width: 2px;
  height: 2px;
  animation-delay: -5.2s;
}

.scan-particles span:nth-child(8) {
  top: 58%;
  right: 43%;
  width: 3px;
  height: 3px;
  animation-delay: -2.9s;
}

.scan-particles span:nth-child(9) {
  top: 74%;
  left: 47%;
  background: rgba(120, 210, 255, 0.58);
  animation-delay: -6.1s;
}

.scan-particles span:nth-child(10) {
  top: 18%;
  right: 45%;
  width: 2px;
  height: 2px;
  animation-delay: -3.8s;
}

.palm-scan-stage.scanning .scan-particles span {
  opacity: 0.72;
  animation-duration: 4.8s;
}

.scan-status-list {
  display: grid;
  gap: 6px;
  width: min(300px, 90%);
  padding: 0;
  margin: 14px auto 0;
  color: rgba(246, 240, 255, 0.62);
  font-size: 12px;
  line-height: 1.4;
  list-style: none;
}

.scan-status-list li {
  position: relative;
  padding-left: 16px;
  text-align: left;
  opacity: 0.58;
  animation: statusStep 2.7s ease-in-out infinite;
}

.scan-status-list li::before {
  position: absolute;
  top: 0.65em;
  left: 0;
  width: 5px;
  height: 5px;
  content: "";
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 10px rgba(245, 203, 115, 0.36);
  transform: translateY(-50%);
}

.scan-status-list li:nth-child(2) {
  animation-delay: 0.45s;
}

.scan-status-list li:nth-child(3) {
  animation-delay: 0.9s;
}

.scan-info-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
}

.scan-info-list article {
  display: grid;
  grid-template-columns: auto minmax(0, 0.82fr) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 72px;
  padding: 13px 16px;
  border: 1px solid rgba(245, 203, 115, 0.12);
  border-radius: 14px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.024)),
    rgba(255, 255, 255, 0.03);
}

.scan-info-icon {
  display: grid;
  width: 42px;
  height: 42px;
  color: var(--gold);
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: 50%;
  background: rgba(147, 86, 255, 0.16);
  place-items: center;
}

.scan-info-icon :deep(svg) {
  width: 21px;
  height: 21px;
}

.scan-info-list strong {
  color: #fff0b8;
  font-size: 16px;
}

.scan-info-list small {
  color: rgba(246, 240, 255, 0.52);
  font-size: 13px;
  text-align: right;
}

.page-disclaimer {
  margin: 18px 0 0;
  color: rgba(246, 240, 255, 0.42);
  font-size: 14px;
  text-align: center;
}

@keyframes scanLineMove {
  0%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }
  14% {
    opacity: 0.68;
  }
  54% {
    opacity: 1;
  }
  100% {
    transform: translateY(var(--scan-travel));
  }
}

@keyframes palmGlowPulse {
  0%,
  100% {
    filter:
      drop-shadow(0 0 7px rgba(245, 203, 115, 0.78))
      drop-shadow(0 0 22px rgba(245, 203, 115, 0.36));
    opacity: 0.88;
    transform: scale(0.995);
  }
  50% {
    filter:
      drop-shadow(0 0 12px rgba(245, 203, 115, 0.95))
      drop-shadow(0 0 32px rgba(245, 203, 115, 0.54))
      drop-shadow(0 0 18px rgba(120, 210, 255, 0.14));
    opacity: 1;
    transform: scale(1.012);
  }
}

@keyframes palmImagePulse {
  0%,
  100% {
    transform: scale(0.998);
  }
  50% {
    transform: scale(1.01);
  }
}

@keyframes ringRotate {
  from {
    transform: translate(-50%, -55%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -55%) rotate(360deg);
  }
}

@keyframes ringRotateInner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes particleFloat {
  0%,
  100% {
    opacity: 0.28;
    transform: translate3d(0, 0, 0) scale(0.9);
  }
  45% {
    opacity: 0.72;
    transform: translate3d(8px, -14px, 0) scale(1.08);
  }
  72% {
    opacity: 0.45;
    transform: translate3d(-7px, 8px, 0) scale(0.96);
  }
}

@keyframes cornerPulse {
  0%,
  100% {
    opacity: 0.62;
    filter: drop-shadow(0 0 8px rgba(245, 203, 115, 0.22));
  }
  50% {
    opacity: 1;
    filter:
      drop-shadow(0 0 12px rgba(245, 203, 115, 0.42))
      drop-shadow(0 0 10px rgba(120, 210, 255, 0.12));
  }
}

@keyframes scan-zone-light {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(var(--scan-travel));
  }
}

@keyframes statusStep {
  0%,
  100% {
    color: rgba(246, 240, 255, 0.52);
    opacity: 0.56;
  }
  50% {
    color: #fff0b8;
    opacity: 1;
  }
}

@media (max-width: 1120px) {
  .palm-page {
    width: min(100% - 32px, 820px);
  }

  .palm-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .palm-page {
    width: min(100% - 20px, 520px);
    padding-top: 20px;
  }

  .palm-control,
  .palm-scan-panel {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .palm-title-block h1 {
    font-size: 38px;
  }

  .palm-title-block p:last-child {
    font-size: 15px;
    line-height: 1.75;
  }

  .palm-step-line {
    gap: 8px;
    margin: 24px 0 20px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .palm-step-line::before {
    right: 42px;
    left: 42px;
  }

  .palm-step {
    min-width: 82px;
    font-size: 12px;
  }

  .palm-step b {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }

  .hand-choice-grid,
  .palm-style-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .hand-choice-card,
  .palm-style-card {
    min-height: 76px;
  }

  .palm-upload-card {
    min-height: 210px;
    padding: 22px 18px;
  }

  .palm-upload-card img {
    height: 210px;
  }

  .palm-analyze-button {
    min-height: 54px;
    font-size: 17px;
  }

  .palm-scan-stage {
    --scan-travel: 270px;
    min-height: 430px;
  }

  .scan-orbit {
    width: 320px;
    height: 320px;
  }

  .palm-subject {
    width: 230px;
    height: 260px;
  }

  .scan-copy {
    margin-top: -52px;
  }

  .palm-scan-stage.uploaded .scan-copy {
    margin-top: -42px;
  }

  .scan-copy h2 {
    font-size: 24px;
  }

  .scan-copy p {
    font-size: 14px;
  }

  .scan-corner {
    width: 36px;
    height: 36px;
  }

  .corner-top-left,
  .corner-top-right {
    top: 28px;
  }

  .corner-bottom-left,
  .corner-bottom-right {
    bottom: 86px;
  }

  .corner-top-left,
  .corner-bottom-left {
    left: 28px;
  }

  .corner-top-right,
  .corner-bottom-right {
    right: 28px;
  }

  .scan-info-list article {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .scan-info-list small {
    grid-column: 2;
    text-align: left;
  }

  .scan-status-list {
    width: min(260px, 92%);
    font-size: 11px;
  }
}

@media (max-width: 380px) {
  .palm-title-block h1 {
    font-size: 34px;
  }

  .palm-scan-stage {
    --scan-travel: 238px;
    min-height: 390px;
  }

  .scan-orbit {
    width: 280px;
    height: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scan-beam,
  .scan-beam::after,
  .scan-orbit,
  .scan-orbit span,
  .scan-corner,
  .scan-particles span,
  .palm-outline,
  .palm-subject img,
  .palm-scan-stage::after,
  .scan-status-list li {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
