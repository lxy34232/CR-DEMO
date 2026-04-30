import { defineStore } from 'pinia'
import { SAMPLE_REPORTS } from '@/utils/sampleData'
import { MODULE_LIST } from '@/utils/moduleConfig'

const STORAGE_KEY = 'cr_demo_reports'

function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_REPORTS))
    return SAMPLE_REPORTS
  }
  try {
    return JSON.parse(existing)
  } catch {
    return SAMPLE_REPORTS
  }
}

export const useDataStore = defineStore('data', {
  state: () => ({
    reports: []
  }),
  getters: {
    allReports: (state) => state.reports,
    submittedReports: (state) => state.reports.filter(r => r.status !== 'draft'),
    getReportById: (state) => (id) => state.reports.find(r => r.id === id),
    getStatusLabel: () => (status) => {
      const map = { draft: '草稿', submitted: '已提交', revision: '待修改', approved: '已批准', rejected: '已驳回' }
      return map[status] || status
    },
    getStatusType: () => (status) => {
      const map = { draft: 'info', submitted: 'success', revision: 'warning', approved: 'success', rejected: 'danger' }
      return map[status] || 'info'
    },
    getCompletionPercent: () => (report) => {
      if (!report?.moduleCompletion) return 0
      const total = MODULE_LIST.length
      const done = Object.values(report.moduleCompletion).filter(Boolean).length
      return Math.round((done / total) * 100)
    }
  },
  actions: {
    init() {
      this.reports = initStorage()
    },
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports))
    },
    saveModuleData(reportId, moduleCode, data) {
      const report = this.reports.find(r => r.id === reportId)
      if (!report) return
      if (!report.moduleData) report.moduleData = {}
      report.moduleData[moduleCode] = data
      report.moduleCompletion[moduleCode] = true
      report.updatedAt = new Date().toISOString()
      this.save()
    },
    submitReport(reportId) {
      const report = this.reports.find(r => r.id === reportId)
      if (!report) return
      report.status = 'submitted'
      report.submittedAt = new Date().toISOString()
      report.updatedAt = new Date().toISOString()
      this.save()
    },
    updateReportStatus(reportId, status, note = '') {
      const report = this.reports.find(r => r.id === reportId)
      if (!report) return
      report.status = status
      if (note) report.revisionNote = note
      report.updatedAt = new Date().toISOString()
      this.save()
    },
    resetToDemo() {
      this.reports = JSON.parse(JSON.stringify(SAMPLE_REPORTS))
      this.save()
    }
  }
})
