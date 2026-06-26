<template>
  <header class="site-header">
    <RouterLink class="brand" to="/" aria-label="灵犀阁首页" @click="drawerOpen = false">
      <span class="brand-mark">灵</span>
      <span class="brand-copy">
        <span class="brand-text">灵犀阁</span>
        <small>洞见未来 · 连接内心</small>
      </span>
    </RouterLink>

    <nav class="desktop-nav" aria-label="主导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :class="['nav-link', { active: isActive(item.to) }]"
        :to="item.to"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <button
      class="menu-button"
      type="button"
      :aria-label="drawerOpen ? '关闭导航' : '打开导航'"
      :aria-expanded="drawerOpen"
      @click="drawerOpen = !drawerOpen"
    >
      <Menu class="button-icon" />
    </button>

    <Transition name="mobile-menu-fade">
      <button
        v-if="drawerOpen"
        class="mobile-menu-backdrop"
        type="button"
        aria-label="关闭导航"
        @click="drawerOpen = false"
      />
    </Transition>

    <Transition name="mobile-menu-slide">
      <aside v-if="drawerOpen" class="mobile-menu-panel" aria-label="移动端导航">
        <div class="drawer-title">
          <span class="brand-mark small">灵</span>
          <span>
            灵犀阁
            <small>洞见未来 · 连接内心</small>
          </span>
        </div>
        <nav class="mobile-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :class="['mobile-link', { active: isActive(item.to) }]"
            :to="item.to"
            @click="drawerOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Menu from '@lucide/vue/dist/esm/icons/menu.mjs'

const drawerOpen = ref(false)
const route = useRoute()

const navItems = [
  { label: '首页', to: '/' },
  { label: '手相', to: '/palm' },
  { label: '面相', to: '/face' },
  { label: '八字', to: '/bazi' },
  { label: '塔罗', to: '/tarot' },
  { label: '今日灵签', to: '/daily' },
  { label: '历史记录', to: '/history' },
  { label: '会员中心', to: '/member' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
  padding: 0 max(22px, calc((100vw - 1200px) / 2));
  border-bottom: 1px solid rgba(245, 203, 115, 0.16);
  background:
    linear-gradient(90deg, rgba(9, 7, 15, 0.86), rgba(20, 11, 33, 0.78)),
    rgba(9, 7, 15, 0.76);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  color: #160c0a;
  font-weight: 800;
  place-items: center;
  border: 1px solid rgba(255, 242, 184, 0.7);
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 28%, #fff5bf, #f5cb73 58%, #9f7434 100%);
  box-shadow: 0 0 28px rgba(245, 203, 115, 0.28);
}

.brand-mark.small {
  width: 34px;
  height: 34px;
}

.brand-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.brand-text {
  font-size: 20px;
  font-weight: 900;
  white-space: nowrap;
}

.brand-copy small,
.drawer-title small {
  display: block;
  color: rgba(247, 241, 255, 0.52);
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.desktop-nav {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 16px;
  color: rgba(247, 241, 255, 0.72);
  border-radius: 999px;
  border: 1px solid transparent;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-link:hover {
  color: var(--text);
  background: rgba(245, 203, 115, 0.09);
}

.nav-link.active {
  color: var(--gold-light);
  border-color: rgba(245, 203, 115, 0.38);
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 203, 115, 0.16), transparent 70%),
    rgba(245, 203, 115, 0.11);
  box-shadow: 0 0 22px rgba(245, 203, 115, 0.12);
}

.menu-button {
  display: none;
  width: 42px;
  height: 42px;
  color: var(--text);
  position: relative;
  z-index: 32;
  border: 1px solid rgba(245, 203, 115, 0.24);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}

.menu-button[aria-expanded='true'] {
  border-color: rgba(244, 210, 132, 0.54);
  background: rgba(244, 210, 132, 0.14);
}

.drawer-title {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 18px;
  color: var(--text);
  font-size: 18px;
  font-weight: 700;
}

.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: none;
  border: 0;
  background: rgba(5, 3, 10, 0.42);
  backdrop-filter: blur(2px);
}

.mobile-menu-panel {
  position: fixed;
  top: 82px;
  right: max(12px, env(safe-area-inset-right, 0px));
  z-index: 120;
  display: none;
  width: min(320px, calc(100vw - 24px));
  max-height: calc(100vh - 100px);
  padding: 18px;
  overflow-y: auto;
  border: 1px solid rgba(245, 203, 115, 0.22);
  border-radius: var(--radius-lg);
  background: rgba(16, 9, 29, 0.98);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.45);
}

.mobile-nav {
  display: grid;
  gap: 10px;
}

.mobile-link {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 14px 16px;
  color: var(--muted);
  font-size: 16px;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
}

.mobile-link.active {
  color: #17100b;
  border-color: var(--gold);
  background: linear-gradient(135deg, #fff2b8, var(--gold) 56%, #b98b3e);
}

.mobile-menu-fade-enter-active,
.mobile-menu-fade-leave-active,
.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.mobile-menu-fade-enter-from,
.mobile-menu-fade-leave-to {
  opacity: 0;
}

.mobile-menu-slide-enter-from,
.mobile-menu-slide-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

@media (max-width: 980px) {
  .desktop-nav {
    display: none;
  }

  .menu-button {
    display: grid;
    place-items: center;
  }

  .mobile-menu-backdrop,
  .mobile-menu-panel {
    display: block;
  }
}

@media (max-width: 520px) {
  .site-header {
    height: 64px;
    padding-inline: 12px;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
  }

  .brand-text {
    font-size: 17px;
  }

  .brand-copy small {
    display: none;
  }

  .mobile-menu-panel {
    top: 72px;
    left: 12px;
    right: 12px;
    width: auto;
    max-height: calc(100vh - 88px);
  }
}
</style>
