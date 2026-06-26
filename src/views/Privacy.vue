<template>
  <section class="page narrow doc-page">
    <article class="doc-panel glass-panel gold-frame">
      <Shield class="doc-icon" />
      <p class="eyebrow">Privacy</p>
      <h1>隐私说明</h1>

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
import Shield from '@lucide/vue/dist/esm/icons/shield.mjs'

const items = [
  { title: '基础原则', text: '本平台重视用户隐私，所有测算体验都以必要、有限、透明为原则。' },
  { title: '图片使用', text: '用户上传的手相、面相照片仅用于生成测算体验，不保存用户原始图片。' },
  { title: '报告与订单', text: '报告与订单会保存在数据库中，用于展示结果、解锁状态和后台统计。' },
  { title: '匿名历史记录', text: '为方便在不登录的情况下查看历史记录，系统会在你的浏览器本地生成一个匿名标识，用于区分不同设备的报告记录。该标识仅用于历史记录展示，不用于识别真实身份。清除浏览器缓存后，历史记录可能无法继续关联。' },
  { title: '今日灵签', text: '今日灵签功能会在浏览器本地保存当天抽取结果，用于避免同一天重复生成。该数据仅用于本地展示，不用于识别真实身份。' },
  { title: '信息边界', text: '出生信息仅用于生成八字分析。平台不会出售、公开或转让用户个人信息。' },
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
