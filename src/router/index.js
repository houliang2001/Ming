import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const PalmReading = () => import('../views/PalmReading.vue')
const FaceReading = () => import('../views/FaceReading.vue')
const BaziReading = () => import('../views/BaziReading.vue')
const TarotReading = () => import('../views/TarotReading.vue')
const DailyFortune = () => import('../views/DailyFortune.vue')
const Result = () => import('../views/Result.vue')
const History = () => import('../views/History.vue')
const Member = () => import('../views/Member.vue')
const Privacy = () => import('../views/Privacy.vue')
const Disclaimer = () => import('../views/Disclaimer.vue')
const Admin = () => import('../views/Admin.vue')

const routes = [
  { path: '/', name: 'home', component: Home, meta: { title: '首页' } },
  { path: '/palm', name: 'palm', component: PalmReading, meta: { title: '手相测算' } },
  { path: '/face', name: 'face', component: FaceReading, meta: { title: '面相测算' } },
  { path: '/bazi', name: 'bazi', component: BaziReading, meta: { title: '生辰八字' } },
  { path: '/tarot', name: 'tarot', component: TarotReading, meta: { title: '塔罗牌' } },
  { path: '/daily', name: 'daily', component: DailyFortune, meta: { title: '今日灵签' } },
  { path: '/result/:id', name: 'result', component: Result, meta: { title: '测算报告' } },
  { path: '/result', redirect: '/history' },
  { path: '/history', name: 'history', component: History, meta: { title: '历史记录' } },
  { path: '/member', name: 'member', component: Member, meta: { title: '会员中心' } },
  { path: '/privacy', name: 'privacy', component: Privacy, meta: { title: '隐私说明' } },
  { path: '/disclaimer', name: 'disclaimer', component: Disclaimer, meta: { title: '免责声明' } },
  { path: '/admin', name: 'admin', component: Admin, meta: { title: '数据后台' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'AI玄学测算'} | 灵犀阁`
})

export default router
