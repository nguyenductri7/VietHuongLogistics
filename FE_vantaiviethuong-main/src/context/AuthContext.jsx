// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // đang check token lúc load app

  // Khi app khởi động: kiểm tra token cũ còn hợp lệ không
  useEffect(() => {
    const token = localStorage.getItem('vh_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.getMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('vh_token') // token hết hạn → xóa
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password) // throws nếu lỗi
    localStorage.setItem('vh_token', res.token)
    setUser(res.user)
    return res
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vh_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook tiện dụng
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider')
  return ctx
}
