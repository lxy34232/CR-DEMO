import axios from 'axios'
import { ElMessage } from 'element-plus'

// 判断是否运行在 Demo 模式（GitHub Pages 静态部署，无后端）
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动注入 Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cr_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理错误 & 自动刷新 Token
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data.code && data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  async (error) => {
    if (error.response?.status === 401) {
      // 尝试刷新 Token
      const refreshToken = localStorage.getItem('cr_refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
          const { access_token, refresh_token: newRefresh } = res.data.data
          localStorage.setItem('cr_access_token', access_token)
          localStorage.setItem('cr_refresh_token', newRefresh)
          // 重试原请求
          error.config.headers.Authorization = `Bearer ${access_token}`
          return apiClient(error.config)
        } catch {
          // 刷新失败，清除登录状态
          localStorage.removeItem('cr_access_token')
          localStorage.removeItem('cr_refresh_token')
          localStorage.removeItem('cr_auth_user')
          window.location.href = '/#/login'
        }
      }
    }
    const msg = error.response?.data?.detail || error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default apiClient
