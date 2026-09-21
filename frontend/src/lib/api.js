import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('dailygram_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dailygram_token')
      localStorage.removeItem('dailygram_user')
    }
    return Promise.reject(error)
  }
)

export const getError = error => error?.response?.data?.message || error?.message || 'Something went wrong'
export default api
