import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { DEMO_MODE } from '@/api/client'

// Demo 模式预设账号（用于 GitHub Pages 静态部署）
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
    user: null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isEnterprise: (state) => state.user?.role === 'enterprise',
    isAdmin: (state) => state.user?.role === 'admin',
    isDemoMode: () => DEMO_MODE,
  },
  actions: {
    init() {
      const saved = localStorage.getItem('cr_auth_user')
      if (saved) {
        try { this.user = JSON.parse(saved) } catch { this.user = null }
      }
    },

    async login(username, password) {
      if (DEMO_MODE) {
        return this._demoLogin(username, password)
      }
      return this._apiLogin(username, password)
    },

    _demoLogin(username, password) {
      const user = Object.values(DEMO_USERS).find(
        u => u.username === username && u.password === password
      )
      if (!user) return { success: false, message: '用户名或密码错误' }
      const { password: _, ...safeUser } = user
      this.user = safeUser
      localStorage.setItem('cr_auth_user', JSON.stringify(safeUser))
      return { success: true }
    },

    async _apiLogin(username, password) {
      this.loading = true
      try {
        const res = await authApi.login(username, password)
        const data = res.data
        localStorage.setItem('cr_access_token', data.access_token)
        localStorage.setItem('cr_refresh_token', data.refresh_token)
        this.user = {
          userId: data.user_id,
          username: data.username,
          role: data.role,
          companyName: data.company_name,
        }
        localStorage.setItem('cr_auth_user', JSON.stringify(this.user))
        return { success: true }
      } catch (err) {
        return { success: false, message: err.message || '登录失败' }
      } finally {
        this.loading = false
      }
    },

    async register(data) {
      if (DEMO_MODE) return { success: false, message: 'Demo 模式不支持注册' }
      try {
        await authApi.register(data)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.message || '注册失败' }
      }
    },

    logout() {
      this.user = null
      localStorage.removeItem('cr_auth_user')
      localStorage.removeItem('cr_access_token')
      localStorage.removeItem('cr_refresh_token')
    }
  }
})
