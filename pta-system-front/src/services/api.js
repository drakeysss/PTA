import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


api.interceptors.request.use(
  (config) => {
    // Add API-KEY header for non-auth requests only (to avoid CORS issues with login)
    const apiKey = import.meta.env.VITE_API_KEY
    if (apiKey && !config.url.includes('/auth/')) {
      config.headers['API-KEY'] = apiKey
    }

    // Add Authorization header for authenticated requests
    const user = JSON.parse(localStorage.getItem('ptaUser') || '{}')
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error('API Error:', error)
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('ptaUser')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      console.error('Access forbidden')
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred')
    } else if (!error.response) {
      console.error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)


export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      // Backend returns user data directly, not wrapped in a data object
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.messages?.error_messages?.message ||
               error.response?.data?.message ||
               'Login failed'
      }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Logout failed' }
    }
  }
}


export const studentAPI = {
  search: async (query) => {
    try {
      const response = await api.get(`/students/search?q=${encodeURIComponent(query)}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Search failed' 
      }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get student' 
      }
    }
  },

  create: async (studentData) => {
    try {
      const response = await api.post('/students', studentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create student' 
      }
    }
  },

  update: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update student' 
      }
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/students/${id}`)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete student' 
      }
    }
  }
}


export const paymentAPI = {
  processPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Payment processing failed' 
      }
    }
  },

  getPaymentHistory: async (studentId) => {
    try {
      const response = await api.get(`/payments/student/${studentId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get payment history' 
      }
    }
  },

  getDailyTotal: async (date) => {
    try {
      const response = await api.get(`/payments/daily-total?date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get daily total' 
      }
    }
  }
}


export const cashierAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/cashiers')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get cashiers' 
      }
    }
  },

  create: async (cashierData) => {
    try {
      const response = await api.post('/cashiers', cashierData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create cashier' 
      }
    }
  },

  update: async (id, cashierData) => {
    try {
      const response = await api.put(`/cashiers/${id}`, cashierData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update cashier' 
      }
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/cashiers/${id}`)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete cashier' 
      }
    }
  }
}

export default api
