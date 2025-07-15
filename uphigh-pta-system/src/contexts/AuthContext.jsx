import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    const savedUser = localStorage.getItem('ptaUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const result = await authAPI.login(username, password)

      if (result.success !== false && result.user) {
        const user = {
          id: result.user.id,
          username: result.user.username,
          name: result.user.full_name,
          role: result.user.role,
          token: result.user.token,
          loginTime: new Date().toISOString()
        }

        setCurrentUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('ptaUser', JSON.stringify(user))
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {

    } finally {
      setCurrentUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('ptaUser')
    }
  }

  const value = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
