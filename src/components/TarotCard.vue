<template>
  <div :class="['tarot-card', { flipped }]">
    <div class="tarot-inner">
      <div class="tarot-face tarot-back">
        <Star class="star-icon" />
        <span>{{ label }}</span>
      </div>
      <div class="tarot-face tarot-front">
        <small>{{ label }}</small>
        <strong>{{ card?.name || '未知牌' }}</strong>
        <span>{{ card?.orientation || '正位' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import Star from '@lucide/vue/dist/esm/icons/star.mjs'

defineProps({
  card: { type: Object, default: null },
  flipped: { type: Boolean, default: false },
  label: { type: String, default: '灵犀牌' },
})
</script>

<style scoped>
.tarot-card {
  width: 156px;
  height: 236px;
  perspective: 900px;
  filter: drop-shadow(0 0 20px rgba(180, 91, 255, 0.22));
}

.tarot-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s ease;
  transform-style: preserve-3d;
}

.tarot-card.flipped .tarot-inner {
  transform: rotateY(180deg);
}

.tarot-face {
  position: absolute;
  inset: 0;
  display: grid;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(245, 203, 115, 0.72);
  border-radius: var(--radius-md);
  backface-visibility: hidden;
  place-items: center;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.38),
    0 0 24px rgba(203, 123, 255, 0.24),
    inset 0 0 22px rgba(245, 203, 115, 0.07);
}

.tarot-back {
  color: var(--gold);
  background:
    radial-gradient(circle at 50% 50%, rgba(245, 203, 115, 0.22), transparent 26%),
    radial-gradient(circle at 50% 50%, transparent 0 54px, rgba(245, 203, 115, 0.22) 55px 56px, transparent 57px),
    linear-gradient(145deg, rgba(245, 203, 115, 0.16), rgba(177, 139, 255, 0.1)),
    #160b27;
}

.tarot-back::before {
  position: absolute;
  inset: 10px;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.25);
  border-radius: calc(var(--radius-md) - 6px);
}

.tarot-back::after {
  position: absolute;
  inset: 42px;
  content: "";
  border: 1px solid rgba(245, 203, 115, 0.18);
  border-radius: 50%;
}

.tarot-front {
  color: #25160d;
  background:
    linear-gradient(145deg, #fff0b6, #d6a85a),
    #f4d284;
  transform: rotateY(180deg);
}

.star-icon {
  width: 58px;
  height: 58px;
  filter: drop-shadow(0 0 18px rgba(245, 203, 115, 0.36));
}

.tarot-back span {
  align-self: end;
  font-size: 13px;
}

.tarot-front small {
  align-self: start;
  opacity: 0.78;
}

.tarot-front strong {
  font-size: 20px;
}

.tarot-front span {
  align-self: end;
  font-weight: 700;
}

@media (max-width: 520px) {
  .tarot-card {
    width: clamp(96px, 29vw, 118px);
    height: clamp(150px, 45vw, 182px);
  }

  .tarot-front strong {
    font-size: 16px;
  }

  .tarot-face {
    padding: 12px 10px;
  }
}
</style>
