<template>
  <section class="page face-page">
    <div class="face-layout">
      <section class="face-panel face-control">
        <div class="face-title-block">
          <p class="face-kicker">
            <span></span>
            Face Reading
            <span></span>
          </p>
          <h1>面相测算</h1>
          <p>上传清晰的正脸照片，AI 智能识别面部特征，为你解读气质格局与人生趋势。</p>
        </div>

        <div class="face-step-line" aria-label="面相测算流程">
          <div v-for="(step, index) in steps" :key="step" class="face-step" :class="{ active: index === 0 }">
            <b>{{ index + 1 }}</b>
            <span>{{ step }}</span>
          </div>
        </div>

        <input
          ref="inputRef"
          class="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="handleFile"
        />

        <button class="face-upload-card" type="button" @click="openPicker">
          <template v-if="photo?.preview">
            <img :src="photo.preview" alt="正脸照片预览" />
            <span class="upload-change">点击重新上传</span>
          </template>
          <template v-else>
            <span class="upload-aura">
              <UploadCloud class="upload-icon" />
            </span>
            <strong>点击上传正脸照片</strong>
            <small>请上传正脸、无遮挡、光线自然的照片</small>
            <em>支持 JPG / PNG / WEBP 格式，建议大小 2MB 以内</em>
          </template>
        </button>

        <div class="report-style-block">
          <h2>
            <span></span>
            报告风格
            <span></span>
          </h2>
          <div class="face-style-grid">
            <button
              v-for="style in styleOptions"
              :key="style.value"
              :class="['face-style-card', { active: reportStyle === style.value }]"
              type="button"
              @click="reportStyle = style.value"
            >
              <component :is="style.icon" class="style-icon" />
              <strong>{{ style.value }}</strong>
              <small>{{ style.hint }}</small>
              <CircleCheck class="style-check" />
            </button>
          </div>
        </div>

        <button
          class="face-analyze-button"
          type="button"
          :disabled="loading"
          @click="startAnalyze"
        >
          <Sparkles class="button-icon" />
          {{ loading ? '正在分析面部特征……' : '开始分析' }}
        </button>

        <p class="privacy-note">
          <ShieldCheck class="privacy-icon" />
          我们将严格保护你的隐私信息
        </p>
      </section>

      <aside class="face-panel face-scan-panel">
        <div class="face-scan-stage" :class="{ uploaded: photo?.preview }">
          <span class="scan-corner corner-top-left"></span>
          <span class="scan-corner corner-top-right"></span>
          <span class="scan-corner corner-bottom-left"></span>
          <span class="scan-corner corner-bottom-right"></span>

          <div class="scan-rings" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <i class="scan-light"></i>

          <div class="scan-subject">
            <img v-if="photo?.preview" :src="photo.preview" alt="正脸扫描预览" />
            <div v-else class="face-avatar" aria-hidden="true">
              <span class="avatar-head"></span>
              <span class="avatar-body"></span>
              <span class="avatar-eye left"></span>
              <span class="avatar-eye right"></span>
              <span class="avatar-smile"></span>
            </div>
          </div>

          <div class="scan-copy">
            <h2>{{ photo?.preview ? '正脸照片已上传' : '等待上传正脸照片' }}</h2>
            <p>{{ photo?.preview ? '点击开始分析，AI 将生成气质格局解读' : '请上传正脸、无遮挡、光线自然的照片' }}</p>
          </div>
        </div>

        <div class="scan-info-list">
          <article v-for="item in scanInfo" :key="item.title">
            <span class="scan-info-icon">
              <component :is="item.icon" />
            </span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.text }}</small>
            <ArrowRight class="scan-arrow" />
          </article>
        </div>
      </aside>
    </div>

    <LoadingAnalyze
      :active="loading"
      title="正在扫描面相"
      :messages="[
        '正在读取照片信息……',
        '正在识别面部特征……',
        '正在分析气质倾向……',
        '正在生成专属报告……',
      ]"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import ArrowRight from '@lucide/vue/dist/esm/icons/arrow-right.mjs'
import CircleCheck from '@lucide/vue/dist/esm/icons/circle-check.mjs'
import LockKeyhole from '@lucide/vue/dist/esm/icons/lock-keyhole.mjs'
import ScanFace from '@lucide/vue/dist/esm/icons/scan-face.mjs'
import ShieldCheck from '@lucide/vue/dist/esm/icons/shield-check.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import UploadCloud from '@lucide/vue/dist/esm/icons/cloud-upload.mjs'
import Users from '@lucide/vue/dist/esm/icons/users.mjs'
import LoadingAnalyze from '../components/LoadingAnalyze.vue'
import { AiServiceError, analyzeFaceImage } from '../utils/aiService'
import { saveReport } from '../utils/storage'

const router = useRouter()
const inputRef = ref(null)
const photo = ref(null)
const loading = ref(false)
const reportStyle = ref('温和指引')

const steps = ['上传正脸', 'AI识别', '气质分析', '生成报告']
const styleOptions = [
  {
    value: '温和指引',
    hint: '温和建议 · 平衡指引',
    icon: Sparkles,
  },
  {
    value: '气质重点',
    hint: '气质解析 · 优势洞察',
    icon: ScanFace,
  },
  {
    value: '人际重点',
    hint: '人际关系 · 相处建议',
    icon: Users,
  },
]

const scanInfo = [
  {
    title: 'AI 面部气质扫描',
    text: '多维度特征识别与气质建模',
    icon: ScanFace,
  },
  {
    title: '不保存用户原始图片',
    text: '分析后立即删除，保护隐私',
    icon: LockKeyhole,
  },
  {
    title: '仅作体验参考',
    text: '结果仅供娱乐参考，请理性看待',
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

function resolveFaceError(error) {
  if (error instanceof AiServiceError) {
    if (error.code === 'INVALID_IMAGE' || error.status === 400) {
      return error.message || '面相分析失败，请重新上传清晰照片后重试。'
    }
  }

  return '面相分析失败，请重新上传清晰照片后重试。'
}

async function startAnalyze() {
  if (!photo.value?.file) {
    ElMessage.warning('请先上传正脸照片')
    return
  }

  loading.value = true
  const startedAt = Date.now()

  try {
    const report = await analyzeFaceImage(photo.value.file, reportStyle.value)
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    saveReport(report)
    router.push({ name: 'result', params: { id: report.id } })
  } catch (error) {
    await wait(Math.max(0, 1500 - (Date.now() - startedAt)))
    ElMessage.error(resolveFaceError(error))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.face-page {
  position: relative;
  width: min(1320px, calc(100% - 56px));
  padding-top: 30px;
  isolation: isolate;
}

.face-page::before,
.face-page::after {
  position: fixed;
  inset: 76px 0 0;
  z-index: -1;
  pointer-events: none;
  content: "";
}

.face-page::before {
  background:
    radial-gradient(circle at 50% 30%, rgba(245, 203, 115, 0.12), transparent 24%),
    radial-gradient(circle at 50% 42%, rgba(132, 72, 255, 0.2), transparent 42%),
    radial-gradient(circle at 4% 56%, rgba(245, 203, 115, 0.08), transparent 18%),
    radial-gradient(circle at 96% 54%, rgba(245, 203, 115, 0.08), transparent 18%),
    linear-gradient(180deg, #070713 0%, #13091f 54%, #050711 100%);
}

.face-page::after {
  opacity: 0.28;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.55) 0 1px, transparent 1px),
    radial-gradient(circle, rgba(245, 203, 115, 0.48) 0 1px, transparent 1px),
    radial-gradient(circle at 4% 52%, transparent 0 150px, rgba(245, 203, 115, 0.075) 151px 152px, transparent 153px),
    radial-gradient(circle at 96% 52%, transparent 0 150px, rgba(245, 203, 115, 0.075) 151px 152px, transparent 153px),
    linear-gradient(115deg, transparent 0 18%, rgba(245, 203, 115, 0.06) 18.2%, transparent 18.5% 81%, rgba(245, 203, 115, 0.055) 81.2%, transparent 81.5%);
  background-position:
    0 0,
    48px 74px,
    left center,
    right center,
    center;
  background-size:
    124px 124px,
    184px 184px,
    auto,
    auto,
    auto;
}

.face-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
  gap: 24px;
  align-items: stretch;
}

.face-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(245, 203, 115, 0.25);
  border-radius: 28px;
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

.face-panel::before {
  position: absolute;
  inset: 10px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.13);
  border-radius: 22px;
}

.face-control {
  padding: 36px 34px 24px;
}

.face-title-block {
  position: relative;
  z-index: 1;
  max-width: 620px;
}

.face-kicker {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  margin: 0 0 12px;
  color: var(--gold);
  font-family: var(--font-tech);
  font-size: 18px;
  font-weight: 800;
}

.face-kicker span {
  display: block;
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.82), transparent);
}

.face-title-block h1 {
  margin: 0;
  color: #fff5df;
  font-family: var(--font-serif);
  font-size: clamp(48px, 4.7vw, 66px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: 2px;
  text-shadow: 0 0 26px rgba(245, 203, 115, 0.18);
}

.face-title-block p:last-child {
  max-width: 560px;
  margin: 18px 0 0;
  color: rgba(246, 240, 255, 0.72);
  font-size: 17px;
  line-height: 1.85;
}

.face-step-line {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin: 28px 0 24px;
}

.face-step-line::before {
  position: absolute;
  top: 24px;
  right: 7%;
  left: 7%;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.36), transparent);
}

.face-step {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  justify-items: center;
  color: rgba(246, 240, 255, 0.55);
  font-weight: 700;
}

.face-step b {
  display: grid;
  width: 48px;
  height: 48px;
  color: rgba(246, 240, 255, 0.72);
  font-size: 20px;
  border: 1px solid rgba(245, 203, 115, 0.34);
  border-radius: 50%;
  background: rgba(9, 6, 18, 0.9);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.36);
  place-items: center;
}

.face-step.active {
  color: #fff0b8;
}

.face-step.active b {
  color: #201407;
  border-color: rgba(245, 203, 115, 0.88);
  background: linear-gradient(135deg, #fff0b8, #f5cb73 58%, #b98b3e);
  box-shadow:
    0 0 0 6px rgba(245, 203, 115, 0.08),
    0 0 26px rgba(245, 203, 115, 0.28);
}

.file-input {
  display: none;
}

.face-upload-card {
  position: relative;
  z-index: 1;
  display: grid;
  width: 100%;
  min-height: 220px;
  padding: 28px;
  overflow: hidden;
  color: var(--text);
  cursor: pointer;
  border: 1px dashed rgba(245, 203, 115, 0.48);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 46%, rgba(245, 203, 115, 0.13), transparent 23%),
    radial-gradient(circle at 50% 50%, rgba(137, 78, 255, 0.12), transparent 42%),
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

.face-upload-card::before,
.face-upload-card::after {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  content: "";
  border-top: 1px solid rgba(245, 203, 115, 0.18);
  border-bottom: 1px solid rgba(245, 203, 115, 0.18);
}

.face-upload-card::after {
  inset: 18px;
  border-top: 0;
  border-bottom: 0;
  border-left: 1px solid rgba(245, 203, 115, 0.12);
  border-right: 1px solid rgba(245, 203, 115, 0.12);
}

.face-upload-card:hover {
  border-color: rgba(245, 203, 115, 0.78);
  box-shadow:
    inset 0 0 42px rgba(245, 203, 115, 0.04),
    0 22px 66px rgba(0, 0, 0, 0.32),
    0 0 30px rgba(245, 203, 115, 0.08);
  transform: translateY(-1px);
}

.upload-aura {
  display: grid;
  width: 98px;
  height: 98px;
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
  width: 42px;
  height: 42px;
}

.face-upload-card strong {
  color: #fff0b8;
  font-size: 20px;
}

.face-upload-card small {
  margin-top: 10px;
  color: rgba(246, 240, 255, 0.72);
  font-size: 15px;
}

.face-upload-card em {
  margin-top: 6px;
  color: rgba(246, 240, 255, 0.46);
  font-size: 13px;
  font-style: normal;
}

.face-upload-card img {
  width: 100%;
  height: 246px;
  object-fit: cover;
  border-radius: 16px;
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
  position: relative;
  z-index: 1;
  margin-top: 24px;
}

.report-style-block h2 {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  margin: 0 0 14px;
  color: #fff0b8;
  font-size: 19px;
  font-weight: 800;
}

.report-style-block h2 span {
  width: 16px;
  height: 1px;
  background: rgba(245, 203, 115, 0.72);
}

.face-style-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.face-style-card {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 12px;
  min-height: 86px;
  padding: 15px 15px 14px;
  color: rgba(246, 240, 255, 0.7);
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(245, 203, 115, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(255, 255, 255, 0.035);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.face-style-card:hover,
.face-style-card.active {
  border-color: rgba(245, 203, 115, 0.72);
  background:
    radial-gradient(circle at 12% 0%, rgba(245, 203, 115, 0.18), transparent 60%),
    rgba(245, 203, 115, 0.07);
  box-shadow: 0 0 26px rgba(245, 203, 115, 0.12);
  transform: translateY(-1px);
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

.face-style-card strong {
  color: #fff0b8;
  font-size: 16px;
}

.face-style-card small {
  color: rgba(246, 240, 255, 0.56);
  font-size: 12px;
  line-height: 1.45;
}

.style-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 19px;
  height: 19px;
  color: #201407;
  opacity: 0;
  border-radius: 50%;
  background: var(--gold);
  transform: scale(0.7);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.face-style-card.active .style-check {
  opacity: 1;
  transform: scale(1);
}

.face-analyze-button {
  position: relative;
  z-index: 1;
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

.face-analyze-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 22px 56px rgba(245, 203, 115, 0.32),
    0 0 32px rgba(245, 203, 115, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.face-analyze-button:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
}

.privacy-note {
  position: relative;
  z-index: 1;
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

.face-scan-panel {
  display: grid;
  gap: 18px;
  padding: 36px;
  align-content: center;
}

.face-scan-stage {
  position: relative;
  display: grid;
  min-height: 460px;
  overflow: hidden;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: 26px;
  background:
    radial-gradient(circle at 50% 43%, rgba(245, 203, 115, 0.12), transparent 28%),
    radial-gradient(circle at 50% 46%, rgba(165, 88, 255, 0.18), transparent 42%),
    rgba(255, 255, 255, 0.035);
  place-items: center;
}

.face-scan-stage::before {
  position: absolute;
  inset: 20px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.08);
  border-radius: 20px;
}

.scan-rings,
.scan-rings span {
  position: absolute;
  border-radius: 50%;
}

.scan-rings {
  top: 50%;
  left: 50%;
  width: 410px;
  height: 410px;
  border: 1px solid rgba(245, 203, 115, 0.15);
  transform: translate(-50%, -52%);
}

.scan-rings span {
  inset: 52px;
  border: 1px solid rgba(245, 203, 115, 0.1);
}

.scan-rings span:nth-child(2) {
  inset: 104px;
  border-color: rgba(245, 203, 115, 0.18);
}

.scan-rings span:nth-child(3) {
  inset: 154px;
  border-style: dotted;
  border-color: rgba(245, 203, 115, 0.22);
}

.scan-light {
  position: absolute;
  top: 48%;
  left: 8%;
  z-index: 3;
  width: 84%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(252, 178, 255, 0.9), rgba(245, 203, 115, 0.96), transparent);
  box-shadow:
    0 0 18px rgba(252, 178, 255, 0.6),
    0 0 28px rgba(245, 203, 115, 0.34);
  animation: face-scan 2.5s ease-in-out infinite;
}

.scan-corner {
  position: absolute;
  z-index: 4;
  width: 48px;
  height: 48px;
  border-color: rgba(255, 225, 140, 0.9);
  filter: drop-shadow(0 0 10px rgba(245, 203, 115, 0.28));
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
  bottom: 42px;
  left: 42px;
  border-bottom: 3px solid;
  border-left: 3px solid;
  border-radius: 0 0 0 14px;
}

.corner-bottom-right {
  right: 42px;
  bottom: 42px;
  border-right: 3px solid;
  border-bottom: 3px solid;
  border-radius: 0 0 14px;
}

.scan-subject {
  position: relative;
  z-index: 2;
  display: grid;
  width: 190px;
  height: 190px;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 42%, rgba(245, 203, 115, 0.1), transparent 66%);
}

.scan-subject img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid rgba(245, 203, 115, 0.34);
  border-radius: 50%;
  box-shadow: 0 0 38px rgba(245, 203, 115, 0.12);
}

.face-avatar {
  position: relative;
  width: 168px;
  height: 168px;
  opacity: 0.78;
}

.avatar-head {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 114px;
  height: 124px;
  border: 1px dotted rgba(245, 203, 115, 0.32);
  border-radius: 50% 50% 46% 46%;
  background:
    radial-gradient(circle, rgba(245, 203, 115, 0.14) 1px, transparent 1px);
  background-size: 8px 8px;
  transform: translateX(-50%);
}

.avatar-body {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 148px;
  height: 62px;
  border: 1px dotted rgba(245, 203, 115, 0.24);
  border-bottom: 0;
  border-radius: 50% 50% 0 0;
  transform: translateX(-50%);
}

.avatar-eye {
  position: absolute;
  top: 70px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 14px rgba(245, 203, 115, 0.42);
}

.avatar-eye.left {
  left: 57px;
}

.avatar-eye.right {
  right: 57px;
}

.avatar-smile {
  position: absolute;
  left: 50%;
  top: 96px;
  width: 54px;
  height: 26px;
  border-bottom: 6px solid var(--gold);
  border-radius: 0 0 54px 54px;
  transform: translateX(-50%);
}

.scan-copy {
  position: relative;
  z-index: 4;
  margin-top: -76px;
}

.face-scan-stage.uploaded .scan-copy {
  margin-top: -50px;
}

.scan-copy h2 {
  margin: 0 0 12px;
  color: var(--gold);
  font-family: var(--font-serif);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 22px rgba(245, 203, 115, 0.2);
}

.scan-copy p {
  margin: 0;
  color: rgba(246, 240, 255, 0.66);
  font-size: 16px;
}

.scan-info-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
}

.scan-info-list article {
  display: grid;
  grid-template-columns: auto minmax(0, 0.9fr) minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  min-height: 64px;
  padding: 12px 16px;
  border: 1px solid rgba(245, 203, 115, 0.12);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.024)),
    rgba(255, 255, 255, 0.03);
}

.scan-info-icon {
  display: grid;
  width: 42px;
  height: 42px;
  color: var(--gold);
  border-radius: 50%;
  background: rgba(147, 86, 255, 0.18);
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
  color: rgba(246, 240, 255, 0.5);
  font-size: 13px;
  text-align: right;
}

.scan-arrow {
  width: 17px;
  height: 17px;
  color: rgba(245, 203, 115, 0.5);
}

@keyframes face-scan {
  0%,
  100% {
    transform: translateY(-50px);
    opacity: 0.45;
  }
  50% {
    transform: translateY(50px);
    opacity: 1;
  }
}

@media (max-width: 1120px) {
  .face-page {
    width: min(100% - 32px, 820px);
  }

  .face-layout {
    grid-template-columns: 1fr;
  }

  .face-scan-panel {
    min-height: auto;
  }
}

@media (max-width: 720px) {
  .face-page {
    width: min(100% - 20px, 520px);
    padding-top: 20px;
  }

  .face-control,
  .face-scan-panel {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .face-title-block h1 {
    font-size: 38px;
  }

  .face-title-block p:last-child {
    font-size: 15px;
    line-height: 1.75;
  }

  .face-step-line {
    gap: 8px;
    margin: 24px 0 20px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .face-step-line::before {
    right: 42px;
    left: 42px;
  }

  .face-step {
    min-width: 82px;
    font-size: 12px;
  }

  .face-step b {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }

  .face-upload-card {
    min-height: 210px;
    padding: 22px 18px;
  }

  .face-upload-card img {
    height: 210px;
  }

  .face-style-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .face-style-card {
    min-height: 76px;
  }

  .face-analyze-button {
    min-height: 54px;
    font-size: 17px;
  }

  .face-scan-stage {
    min-height: 370px;
  }

  .scan-rings {
    width: 310px;
    height: 310px;
  }

  .scan-subject {
    width: 150px;
    height: 150px;
  }

  .face-avatar {
    transform: scale(0.82);
  }

  .scan-copy {
    margin-top: -50px;
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
    bottom: 28px;
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
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
  }

  .scan-info-list small {
    grid-column: 2 / 4;
    text-align: left;
  }
}

@media (max-width: 380px) {
  .face-title-block h1 {
    font-size: 34px;
  }

  .face-scan-stage {
    min-height: 340px;
  }

  .scan-rings {
    width: 270px;
    height: 270px;
  }
}
</style>
