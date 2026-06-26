<template>
  <RouterLink class="feature-card glass-card" :to="to">
    <div class="feature-icon">
      <svg v-if="symbol === 'palm'" class="mystic-symbol palm-symbol" viewBox="0 0 80 80" aria-hidden="true">
        <path class="symbol-fill" d="M39.5 66.5c-12.8 0-22.8-9.5-22.8-22.1V31.5c0-2.1 1.6-3.7 3.6-3.7s3.6 1.6 3.6 3.7v9.4" />
        <path d="M23.9 39.8V19.2c0-2.1 1.6-3.8 3.7-3.8 2 0 3.6 1.7 3.6 3.8v19.1" />
        <path d="M31.2 37.6V14.9c0-2.2 1.7-4 3.9-4 2.1 0 3.8 1.8 3.8 4v22" />
        <path d="M38.9 37.2V17.4c0-2.1 1.7-3.8 3.8-3.8s3.8 1.7 3.8 3.8v23.1" />
        <path d="M46.5 40.8V24.7c0-2.1 1.7-3.8 3.8-3.8s3.8 1.7 3.8 3.8v23.5" />
        <path d="M54.1 45.3l4.6-5.1c1.4-1.6 3.8-1.8 5.3-.4 1.5 1.3 1.7 3.6.4 5.2l-8.6 10.4c-3.9 7.1-9.5 11.1-16.3 11.1" />
        <path class="symbol-detail" d="M27.5 49.6c5.2-2.9 11.9-2.8 17.4.3" />
        <path class="symbol-detail" d="M30.2 56.7c4.5-2.1 9.3-2.1 14 0" />
        <path class="symbol-detail" d="M24.8 28.5h22.8" />
      </svg>

      <svg v-else-if="symbol === 'face'" class="mystic-symbol face-symbol" viewBox="0 0 80 80" aria-hidden="true">
        <path class="symbol-fill" d="M40 67.5c-13.3 0-22.8-11.6-22.8-26.4 0-17.3 9.8-28.6 22.8-28.6s22.8 11.3 22.8 28.6c0 14.8-9.5 26.4-22.8 26.4Z" />
        <path d="M25.1 34.2c4.1-3.2 8.8-4.9 14.9-4.9 6 0 10.8 1.7 14.9 4.9" />
        <path class="symbol-detail" d="M29.2 41.2c3-1.4 5.6-1.4 8.3 0" />
        <path class="symbol-detail" d="M42.5 41.2c2.7-1.4 5.3-1.4 8.3 0" />
        <path d="M39.9 39.2c-1.2 5.8-1.6 9.4-4.1 13.2 2.2 1.1 5.9 1.1 8.2 0-2.3-3.9-2.9-7.6-4.1-13.2Z" />
        <path class="symbol-detail" d="M32.2 57c5.4 3.2 10.2 3.2 15.6 0" />
        <path class="symbol-accent" d="M40 8.5v8.2M40 63.3v8.2M11.5 40h8.2M60.3 40h8.2" />
      </svg>

      <svg v-else-if="symbol === 'bazi'" class="mystic-symbol bazi-symbol" viewBox="0 0 80 80" aria-hidden="true">
        <circle class="symbol-fill" cx="40" cy="40" r="18.5" />
        <path d="M40 21.5c6.5 0 11.2 4.5 11.2 10.1 0 5.3-4.3 9.6-10 9.6h-2.4c-5.8 0-10 4.3-10 9.5 0 5.6 4.8 9.8 11.2 9.8" />
        <circle class="symbol-dot" cx="34.2" cy="32" r="2.4" />
        <circle class="symbol-dot" cx="45.8" cy="48" r="2.4" />
        <path class="symbol-accent" d="M40 8.5v7.4M40 64.1v7.4M8.5 40h7.4M64.1 40h7.4" />
        <path class="trigram" d="M21.2 18.2h7.8M21.2 22.2h3.1M25.9 22.2H29M21.2 26.2h7.8" />
        <path class="trigram" d="M51 18.2h7.8M51 22.2h7.8M51 26.2h3.1M55.7 26.2h3.1" />
        <path class="trigram" d="M21.2 53.8h3.1M25.9 53.8H29M21.2 57.8h7.8M21.2 61.8h3.1M25.9 61.8H29" />
        <path class="trigram" d="M51 53.8h7.8M51 57.8h3.1M55.7 57.8h3.1M51 61.8h7.8" />
      </svg>

      <svg v-else-if="symbol === 'tarot'" class="mystic-symbol tarot-symbol" viewBox="0 0 80 80" aria-hidden="true">
        <rect class="symbol-fill" x="24" y="12" width="32" height="56" rx="4.5" />
        <rect class="symbol-detail rect-detail" x="28.5" y="17" width="23" height="46" rx="2.5" />
        <path class="symbol-accent" d="M40 24.5l3.5 10.4 10.4 3.5-10.4 3.5L40 52.3l-3.5-10.4-10.4-3.5 10.4-3.5L40 24.5Z" />
        <path class="symbol-detail" d="M40 18.8v5.4M40 55.8v5.4M29.6 29.1l3.8 3.8M46.6 46.1l3.8 3.8" />
        <path class="symbol-accent" d="M21.2 25.2c-2.6 7.8-2.6 17.1 0 29.6M58.8 25.2c2.6 7.8 2.6 17.1 0 29.6" />
      </svg>

      <svg v-else-if="symbol === 'daily'" class="mystic-symbol daily-symbol" viewBox="0 0 80 80" aria-hidden="true">
        <path class="symbol-fill" d="M28 15.5h24c2.8 0 5 2.2 5 5v43.8c0 2-2.2 3.2-3.8 2.1L40 57.8 26.8 66.4c-1.7 1.1-3.8-.1-3.8-2.1V20.5c0-2.8 2.2-5 5-5Z" />
        <path class="symbol-detail" d="M30.5 23.8h19M30.5 31.7h19M30.5 39.6h12" />
        <path class="symbol-accent" d="M40 46.5l2.4 5.5 5.6 2.1-5.6 2.1-2.4 5.5-2.4-5.5-5.6-2.1 5.6-2.1 2.4-5.5Z" />
        <path class="symbol-accent" d="M18.2 19.7c-3.2 10.8-3.2 26.9 0 40.6M61.8 19.7c3.2 10.8 3.2 26.9 0 40.6" />
      </svg>

      <component v-else :is="icon" class="icon" />
    </div>
    <div class="feature-copy">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
    <div class="feature-action" aria-hidden="true">
      <span></span>
      <ArrowRight class="arrow" />
      <span></span>
    </div>
  </RouterLink>
</template>

<script setup>
import ArrowRight from '@lucide/vue/dist/esm/icons/arrow-right.mjs'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  to: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  symbol: { type: String, default: '' },
})
</script>

<style scoped>
.feature-card {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 13px;
  min-height: 262px;
  padding: 22px 18px 17px;
  overflow: hidden;
  justify-items: center;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: 8px;
  background:
    radial-gradient(circle at 50% 28%, rgba(245, 203, 115, 0.12), transparent 31%),
    radial-gradient(circle at 96% 88%, rgba(129, 61, 255, 0.22), transparent 34%),
    radial-gradient(circle at 6% 6%, rgba(245, 203, 115, 0.08), transparent 25%),
    linear-gradient(155deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.024)),
    rgba(13, 8, 26, 0.82);
  box-shadow:
    0 22px 58px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card::before {
  position: absolute;
  inset: 10px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.075);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(245, 203, 115, 0.1), transparent 15%),
    linear-gradient(315deg, rgba(132, 72, 255, 0.09), transparent 18%);
}

.feature-card::after {
  position: absolute;
  top: 26px;
  left: 50%;
  width: 96px;
  height: 96px;
  content: "";
  border: 1px solid rgba(244, 210, 132, 0.16);
  border-radius: 50%;
  transform: translateX(-50%);
  background:
    radial-gradient(circle, transparent 0 31px, rgba(245, 203, 115, 0.055) 32px 33px, transparent 34px),
    conic-gradient(from 20deg, transparent 0 14%, rgba(245, 203, 115, 0.2) 15% 16%, transparent 17% 48%, rgba(245, 203, 115, 0.16) 49% 50%, transparent 51% 100%);
  box-shadow:
    inset 0 0 30px rgba(245, 203, 115, 0.045),
    0 0 30px rgba(245, 203, 115, 0.055);
}

.feature-card .feature-icon,
.feature-card .feature-action {
  animation: feature-float 4.8s ease-in-out infinite;
}

.feature-card::before {
  background:
    linear-gradient(120deg, transparent 0 34%, rgba(255, 236, 188, 0.12) 45%, transparent 56%),
    linear-gradient(135deg, rgba(245, 203, 115, 0.1), transparent 15%),
    linear-gradient(315deg, rgba(132, 72, 255, 0.09), transparent 18%);
  background-size: 220% 100%, auto, auto;
  animation: feature-sheen 5.8s ease-in-out infinite;
}

.feature-card:hover {
  border-color: rgba(244, 210, 132, 0.48);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.46),
    0 0 34px rgba(245, 203, 115, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  position: relative;
  z-index: 1;
  display: grid;
  width: 66px;
  height: 66px;
  color: var(--gold);
  place-items: center;
  border: 1px solid rgba(244, 210, 132, 0.3);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 35%, rgba(245, 203, 115, 0.18), transparent 66%),
    rgba(244, 210, 132, 0.06);
  box-shadow:
    inset 0 0 28px rgba(245, 203, 115, 0.06),
    0 0 30px rgba(245, 203, 115, 0.1);
}

.icon,
.mystic-symbol {
  width: 31px;
  height: 31px;
  stroke-width: 1.8;
  filter: drop-shadow(0 0 12px rgba(245, 203, 115, 0.34));
}

.mystic-symbol {
  width: 44px;
  height: 44px;
  overflow: visible;
  color: var(--gold);
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.symbol-fill {
  fill: rgba(245, 203, 115, 0.055);
  stroke-width: 3;
}

.symbol-detail {
  stroke-width: 2;
  opacity: 0.76;
}

.symbol-accent,
.trigram {
  stroke-width: 2.2;
  opacity: 0.88;
}

.symbol-dot {
  fill: currentColor;
  stroke: none;
}

.rect-detail {
  fill: rgba(245, 203, 115, 0.025);
}

h3 {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 700;
  line-height: 1.2;
}

.feature-copy {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  justify-items: center;
  min-height: 0;
}

p {
  position: relative;
  z-index: 1;
  margin: 0;
  max-width: 152px;
  color: rgba(247, 241, 255, 0.66);
  font-size: 14px;
  line-height: 1.62;
}

.feature-action {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(34px, 1fr) auto minmax(34px, 1fr);
  gap: 9px;
  align-items: center;
  width: min(136px, 100%);
  align-self: end;
}

.feature-action span {
  display: block;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245, 203, 115, 0.22));
}

.feature-action span:last-child {
  background: linear-gradient(90deg, rgba(245, 203, 115, 0.22), transparent);
}

.arrow {
  width: 31px;
  height: 31px;
  padding: 7px;
  color: rgba(244, 210, 132, 0.78);
  border: 1px solid rgba(244, 210, 132, 0.32);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  transform: none;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.feature-card:hover .arrow {
  color: #17100b;
  background: linear-gradient(135deg, #fff2b8, var(--gold) 56%, #b98b3e);
  box-shadow: 0 0 22px rgba(245, 203, 115, 0.26);
}

@keyframes feature-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes feature-sheen {
  0%,
  100% {
    background-position: -120% 0, center, center;
  }

  45%,
  55% {
    background-position: 140% 0, center, center;
  }
}

@media (max-width: 620px) {
  .feature-card {
    min-height: 236px;
    padding: 24px 20px 20px;
    gap: 18px;
  }

  .feature-icon {
    width: 68px;
    height: 68px;
  }

  .icon,
  .mystic-symbol {
    width: 31px;
    height: 31px;
  }

  .mystic-symbol {
    width: 40px;
    height: 40px;
  }

  h3 {
    font-size: 22px;
  }

  p {
    font-size: 14px;
    line-height: 1.65;
    max-width: 210px;
  }
}

@media (max-width: 380px) {
  .feature-card {
    min-height: 210px;
  }
}
</style>
