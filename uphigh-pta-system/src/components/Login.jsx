import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !password) {
      setError('Please enter both username and password')
      setLoading(false)
      return
    }

    const result = await login(username, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="container-fluid  d-flex align-items-center justify-content-center ">
      <div className="card card-up-theme shadow-lg" style={{width: '450px'}}>
        <div className="card-header card-header-up-maroon text-center">
          <h3 className="mb-0">🏛️ PTA Cashier System</h3>
          <small className="text-up-gold">University of the Philippines</small>
        </div>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <p className="text-up-forest-green mb-0">Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label text-up-maroon fw-bold">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label text-up-maroon fw-bold">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="alert alert-danger border-up-maroon" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-up-forest-green w-100 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>


        </div>
      </div>
    </div>
  )
}

export default Login
