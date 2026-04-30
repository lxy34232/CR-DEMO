import { defineStore } from 'pinia'

const DEMO_USERS = {
  enterprise: {
    username: 'enterprise',
    password: 'demo123',
    role: 'enterprise',
    companyName: '北京轨道装备制造有限公司',
    contactPerson: '张明',
    reportId: 'RPT-2026-BJ001'
  },
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    companyName: '铁道产品质量认证评审中心',
    contactPerson: '管理员'
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isEnterprise: (state) => state.user?.role === 'enterprise',
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    init() {
      const saved = localStorage.getItem('cr_auth_user')
      if (saved) {
        try { this.user = JSON.parse(saved) } catch { this.user = null }
      }
    },
    login(username, password) {
      const user = Object.values(DEMO_USERS).find(
        u => u.username === username && u.password === password
      )
      if (!user) return { success: false, message: '用户名或密码错误' }
      const { password: _, ...safeUser } = user
      this.user = safeUser
      localStorage.setItem('cr_auth_user', JSON.stringify(safeUser))
      return { success: true }
    },
    logout() {
      this.user = null
      localStorage.removeItem('cr_auth_user')
    }
  }
})
