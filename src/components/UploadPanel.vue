<template>
  <div class="upload-panel">
    <input
      ref="inputRef"
      class="file-input"
      type="file"
      :accept="accept"
      @change="handleFile"
    />

    <button class="upload-box" type="button" @click="openPicker">
      <img v-if="preview" :src="preview" alt="上传预览" />
      <span v-else class="upload-empty">
        <UploadCloud class="upload-icon" />
        <strong>{{ title }}</strong>
        <small>{{ hint }}</small>
      </span>
    </button>

    <div v-if="preview" class="upload-actions">
      <span>{{ fileName }}</span>
      <button type="button" @click="openPicker">重新选择</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import UploadCloud from '@lucide/vue/dist/esm/icons/cloud-upload.mjs'

const props = defineProps({
  modelValue: { type: Object, default: null },
  title: { type: String, default: '上传照片' },
  hint: { type: String, default: '请选择一张清晰照片' },
  accept: { type: String, default: 'image/*' },
})

const emit = defineEmits(['update:modelValue'])
const inputRef = ref(null)
const preview = ref('')
const fileName = ref('')

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      preview.value = ''
      fileName.value = ''
      if (inputRef.value) inputRef.value.value = ''
    }
  },
)

function openPicker() {
  inputRef.value?.click()
}

function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    preview.value = reader.result
    fileName.value = file.name
    emit('update:modelValue', {
      file,
      preview: reader.result,
      name: file.name,
    })
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.upload-panel {
  display: grid;
  gap: 12px;
}

.file-input {
  display: none;
}

.upload-box {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 320px;
  padding: 0;
  overflow: hidden;
  color: var(--text);
  border: 1px dashed rgba(245, 203, 115, 0.46);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 50% 18%, rgba(245, 203, 115, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(245, 203, 115, 0.08), rgba(177, 139, 255, 0.07)),
    rgba(255, 255, 255, 0.04);
  cursor: pointer;
  place-items: center;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.upload-box::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background: linear-gradient(115deg, transparent 0 36%, rgba(255, 236, 188, 0.12) 48%, transparent 60%);
  background-size: 240% 100%;
  animation: upload-sheen 5.6s ease-in-out infinite;
}

.upload-box:hover {
  border-color: rgba(245, 203, 115, 0.72);
  box-shadow: 0 0 32px rgba(245, 203, 115, 0.1);
  transform: translateY(-1px);
}

.upload-box img {
  width: 100%;
  height: 320px;
  object-fit: cover;
}

.upload-empty {
  display: grid;
  gap: 10px;
  padding: 28px;
  text-align: center;
  justify-items: center;
}

.upload-empty strong {
  font-size: 20px;
}

.upload-empty small {
  max-width: 310px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: var(--gold);
  filter: drop-shadow(0 0 16px rgba(245, 203, 115, 0.24));
  animation: upload-icon-float 3.8s ease-in-out infinite;
}

.upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 14px;
}

.upload-actions span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-actions button {
  color: var(--gold);
  border: 0;
  background: transparent;
  cursor: pointer;
  flex: 0 0 auto;
}

@keyframes upload-sheen {
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

@keyframes upload-icon-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 620px) {
  .upload-box {
    min-height: 220px;
  }

  .upload-box img {
    height: 220px;
  }

  .upload-empty {
    padding: 22px 18px;
  }

  .upload-empty strong {
    font-size: 18px;
  }

  .upload-empty small {
    font-size: 13px;
  }

  .upload-actions {
    display: grid;
    gap: 8px;
  }

  .upload-actions button {
    justify-self: start;
  }
}

@media (max-width: 380px) {
  .upload-box {
    min-height: 190px;
  }

  .upload-box img {
    height: 190px;
  }
}
</style>
