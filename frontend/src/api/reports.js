import apiClient from './client'

export const reportsApi = {
  // 报告
  list: () => apiClient.get('/v1/reports'),
  create: () => apiClient.post('/v1/reports'),
  get: (reportId) => apiClient.get(`/v1/reports/${reportId}`),
  submit: (reportId) => apiClient.post(`/v1/reports/${reportId}/submit`),

  // 模块数据
  getModule: (reportId, moduleCode) =>
    apiClient.get(`/v1/reports/${reportId}/modules/${moduleCode}`),
  saveModule: (reportId, moduleCode, data, isCompleted = false) =>
    apiClient.put(`/v1/reports/${reportId}/modules/${moduleCode}`, {
      data,
      is_completed: isCompleted,
    }),

  // 草稿
  saveDraft: (reportId, moduleCode, data) =>
    apiClient.post(`/v1/reports/${reportId}/drafts/${moduleCode}`, { data }),
  getDraft: (reportId, moduleCode) =>
    apiClient.get(`/v1/reports/${reportId}/drafts/${moduleCode}`),
}

export const adminApi = {
  getReports: (params) => apiClient.get('/v1/admin/reports', { params }),
  reviewReport: (reportId, action, reason) =>
    apiClient.post(`/v1/admin/reports/${reportId}/review`, { action, reason }),
  getStats: () => apiClient.get('/v1/admin/stats'),
  getAuditLogs: (params) => apiClient.get('/v1/admin/audit-logs', { params }),
  getUsers: (params) => apiClient.get('/v1/admin/users', { params }),
  toggleUserStatus: (userId, isActive) =>
    apiClient.patch(`/v1/admin/users/${userId}/status`, { is_active: isActive }),
}

export const filesApi = {
  upload: (formData) =>
    apiClient.post('/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUrl: (fileId) => apiClient.get(`/v1/files/${fileId}/url`),
  delete: (fileId) => apiClient.delete(`/v1/files/${fileId}`),
}
