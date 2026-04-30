import { ref, onMounted, onBeforeUnmount } from 'vue'
import { reportsApi } from '@/api/reports'
import { DEMO_MODE } from '@/api/client'

/**
 * 表单自动保存 Composable
 * - 每 3 分钟自动保存草稿到后端（API 模式）或 localStorage（Demo 模式）
 * - 页面离开前提示未保存数据
 */
export function useAutoSave(reportId, moduleCode, getFormData) {
  const saving = ref(false)
  const lastSavedAt = ref(null)
  let timer = null

  const saveDraft = async () => {
    if (saving.value) return
    saving.value = true
    try {
      const data = getFormData()
      if (DEMO_MODE) {
        // Demo 模式：保存到 localStorage
        const key = `draft_${reportId}_${moduleCode}`
        localStorage.setItem(key, JSON.stringify({ data, savedAt: new Date().toISOString() }))
      } else {
        await reportsApi.saveDraft(reportId, moduleCode, data)
      }
      lastSavedAt.value = new Date()
    } catch (e) {
      console.warn('草稿自动保存失败:', e)
    } finally {
      saving.value = false
    }
  }

  const getDraft = async () => {
    try {
      if (DEMO_MODE) {
        const key = `draft_${reportId}_${moduleCode}`
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
      }
      const res = await reportsApi.getDraft(reportId, moduleCode)
      return res.data
    } catch {
      return null
    }
  }

  const startAutoSave = (intervalMs = 3 * 60 * 1000) => {
    timer = setInterval(saveDraft, intervalMs)
  }

  const stopAutoSave = () => {
    if (timer) clearInterval(timer)
  }

  const handleBeforeUnload = (e) => {
    if (saving.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  onMounted(() => {
    startAutoSave()
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    stopAutoSave()
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return { saving, lastSavedAt, saveDraft, getDraft }
}
