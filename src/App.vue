<template>
  <div class="app-shell">
    <AppHeader />
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>
