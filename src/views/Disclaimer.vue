<template>
  <section class="page narrow doc-page">
    <article class="doc-panel glass-panel gold-frame">
      <AlertTriangle class="doc-icon" />
      <p class="eyebrow">Disclaimer</p>
      <h1>免责声明</h1>

      <div class="doc-content">
        <section v-for="item in items" :key="item.title" class="doc-block">
          <h2>{{ item.title }}</h2>
          <p>{{ item.text }}</p>
        </section>
      </div>
    </article>
  </section>
</template>

<script setup>
import AlertTriangle from '@lucide/vue/dist/esm/icons/triangle-alert.mjs'

const items = [
  { title: '体验性质', text: '本平台内容仅供娱乐、文化体验与自我探索参考。' },
  { title: '结果边界', text: '测算结果不代表确定事实，也不构成任何形式的保证或承诺。' },
  { title: '重要决策', text: '本平台不提供医学、法律、投资、婚姻或人生重大决策建议。' },
  { title: '理性看待', text: '用户应理性看待测算结果，重要决定请结合现实情况独立判断。' },
]
</script>

<style scoped>
.doc-panel {
  padding: 38px;
}

.doc-icon {
  width: 42px;
  height: 42px;
  color: var(--gold);
}

.eyebrow {
  margin: 16px 0 10px;
  color: var(--gold);
  font-weight: 700;
}

h1 {
  margin: 0 0 24px;
  font-size: 36px;
}

.doc-content {
  display: grid;
  gap: 14px;
}

.doc-block {
  padding: 18px;
  border: 1px solid rgba(245, 203, 115, 0.14);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.045);
}

.doc-block h2 {
  margin: 0 0 10px;
  color: var(--gold);
  font-size: 18px;
}

.doc-block p {
  margin: 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.8;
}

@media (max-width: 520px) {
  .doc-panel {
    padding: 24px 18px;
  }

  h1 {
    font-size: 26px;
  }

  .doc-content p {
    font-size: 15px;
    line-height: 1.72;
  }
}
</style>
