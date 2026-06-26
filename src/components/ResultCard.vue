<template>
  <article class="result-card glass-card">
    <div class="result-card-head">
      <span>{{ order }}</span>
      <h3>{{ title }}</h3>
    </div>
    <p>{{ content }}</p>
  </article>
</template>

<script setup>
defineProps({
  order: { type: [String, Number], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
})
</script>

<style scoped>
.result-card {
  padding: 22px;
}

.result-card-head {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.result-card-head span {
  display: grid;
  width: 34px;
  height: 34px;
  color: #17100b;
  font-weight: 700;
  place-items: center;
  border-radius: 50%;
  background: var(--gold);
}

h3 {
  margin: 0;
  font-size: 19px;
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}
</style>
