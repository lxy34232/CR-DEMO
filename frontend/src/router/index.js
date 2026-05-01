import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  // Enterprise routes
  {
    path: '/enterprise',
    component: () => import('@/layouts/EnterpriseLayout.vue'),
    meta: { requiresAuth: true, role: 'enterprise' },
    children: [
      { path: '', redirect: '/enterprise/dashboard' },
      { path: 'dashboard', name: 'EnterpriseDashboard', component: () => import('@/views/enterprise/Dashboard.vue') },
      { path: 'module/01', name: 'Module01Form', component: () => import('@/views/enterprise/Module01Form.vue') },
      { path: 'module/:code', name: 'DynamicModuleForm', component: () => import('@/views/enterprise/DynamicModuleForm.vue') },
    ]
  },
  // Admin routes
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'reports', name: 'ReportList', component: () => import('@/views/admin/ReportList.vue') },
      { path: 'reports/:id', name: 'ReportDetail', component: () => import('@/views/admin/ReportDetail.vue') },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!auth.isLoggedIn) {
      return next('/login')
    }
    if (to.meta.role && auth.user.role !== to.meta.role) {
      // Redirect to correct home
      return next(auth.isAdmin ? '/admin/dashboard' : '/enterprise/dashboard')
    }
  }

  if (to.path === '/login' && auth.isLoggedIn) {
    return next(auth.isAdmin ? '/admin/dashboard' : '/enterprise/dashboard')
  }

  next()
})

export default router
