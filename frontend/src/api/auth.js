import apiClient from './client'

export const authApi = {
  login: (username, password) =>
    apiClient.post('/v1/auth/login', { username, password }),

  register: (data) =>
    apiClient.post('/v1/auth/register', data),

  refresh: (refreshToken) =>
    apiClient.post('/v1/auth/refresh', { refresh_token: refreshToken }),
}
