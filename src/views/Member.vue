<template>
  <section class="page narrow member-page">
    <div class="member-hero glass-panel gold-frame">
      <Crown class="member-icon" />
      <p class="eyebrow">Member Center</p>
      <h1>会员中心</h1>
      <p class="section-lead">未来会提供更完整的报告、海报、提醒与 AI 顾问体验。</p>
      <button class="primary-button expect-button" type="button">
        <Sparkles class="button-icon" />
        敬请期待
      </button>
    </div>

    <div class="benefit-grid">
      <article v-for="benefit in benefits" :key="benefit" class="benefit glass-card">
        <Gem class="benefit-icon" />
        <span>{{ benefit }}</span>
      </article>
    </div>
  </section>
</template>

<script setup>
import Crown from '@lucide/vue/dist/esm/icons/crown.mjs'
import Gem from '@lucide/vue/dist/esm/icons/gem.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'

const benefits = [
  '无限历史记录',
  '专属深度报告',
  '每日运势提醒',
  '多次 AI 深度追问',
  '专属海报模板',
]
</script>

<style scoped>
.member-hero {
  display: grid;
  min-height: 420px;
  padding: 40px;
  place-items: center;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 203, 115, 0.14), transparent 36%),
    radial-gradient(circle at 80% 70%, rgba(177, 139, 255, 0.14), transparent 34%),
    rgba(12, 8, 22, 0.78);
}

.member-icon {
  width: 54px;
  height: 54px;
  color: var(--gold);
}

.eyebrow {
  margin: 12px 0 8px;
  color: var(--gold);
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: 38px;
}

.expect-button {
  margin-top: 22px;
  padding: 0 24px;
  font-weight: 700;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-top: 22px;
}

.benefit {
  display: grid;
  min-height: 116px;
  padding: 18px;
  align-content: center;
  justify-items: center;
  gap: 12px;
  text-align: center;
  border-color: rgba(245, 203, 115, 0.16);
}

.benefit-icon {
  width: 24px;
  height: 24px;
  color: var(--gold);
}

@media (max-width: 900px) {
  .benefit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .member-hero {
    min-height: 360px;
    padding: 26px 20px;
  }

  h1 {
    font-size: 26px;
    line-height: 1.3;
  }

  .benefit-grid {
    grid-template-columns: 1fr;
  }

  .benefit {
    min-height: 88px;
  }
}
</style>
