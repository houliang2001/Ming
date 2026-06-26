<template>
  <Transition name="loading-fade">
    <div v-if="active" class="loading-mask">
      <div class="loading-box glass-panel">
        <div class="loading-symbol">
          <span></span>
          <i></i>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ currentMessage }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  title: { type: String, default: 'AI 正在分析' },
  messages: {
    type: Array,
    default: () => ['正在识别结构……', '正在分析关键线索……', '正在生成你的专属报告……'],
  },
})

const index = ref(0)
let timer = null

const currentMessage = computed(() => props.messages[index.value % props.messages.length])

watch(
  () => props.active,
  (active) => {
    if (active) {
      index.value = 0
      timer = window.setInterval(() => {
        index.value += 1
      }, 520)
      return
    }
    window.clearInterval(timer)
  },
)

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<style scoped>
.loading-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  padding: 24px;
  background: rgba(5, 4, 10, 0.72);
  backdrop-filter: blur(10px);
  place-items: center;
}

.loading-box {
  display: grid;
  width: min(420px, 100%);
  padding: 34px;
  text-align: center;
  justify-items: center;
}

.loading-symbol {
  position: relative;
  display: grid;
  width: 118px;
  height: 118px;
  margin-bottom: 18px;
  border: 1px solid rgba(244, 210, 132, 0.3);
  border-radius: 50%;
  place-items: center;
}

.loading-symbol::before,
.loading-symbol::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(110, 203, 255, 0.24);
  border-radius: 50%;
  animation: pulse-ring 1.8s ease-in-out infinite;
}

.loading-symbol::before {
  inset: 12px;
}

.loading-symbol::after {
  inset: 28px;
  animation-delay: 0.32s;
}

.loading-symbol span {
  width: 34px;
  height: 34px;
  border: 2px solid transparent;
  border-top-color: var(--gold);
  border-right-color: var(--blue);
  border-radius: 50%;
  animation: rotate 0.9s linear infinite;
}

.loading-symbol i {
  position: absolute;
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(121, 242, 223, 0.9), transparent);
  box-shadow: 0 0 16px rgba(121, 242, 223, 0.7);
  animation: sweep 1.4s ease-in-out infinite;
}

h3 {
  margin: 0 0 10px;
  font-size: 22px;
}

p {
  min-height: 28px;
  margin: 0;
  color: var(--muted);
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes sweep {
  0%,
  100% {
    transform: translateY(-38px);
  }
  50% {
    transform: translateY(38px);
  }
}

@keyframes pulse-ring {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.08);
  }
}
</style>
