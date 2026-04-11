import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../service/api/auth'
import { tokenService } from '../service/token/tokenService'


export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await login(email, password)

      // Store tokens using tokenService
      if (data.access && data.refresh) {
        tokenService.setTokens({
          access: data.access,
          refresh: data.refresh,
        })
      }

      setSuccess('Login successful! Redirecting...')
      setEmail('')
      setPassword('')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)

      console.log('Login successful:', data)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
       <section className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0A0E1A] text-gray-200 p-4">
  {/* Login Card */}
  <div className="w-full max-w-[360px]">
    <div className="bg-[#111827] border-2 border-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <header className="text-center px-5 py-6 bg-[#1B2233]">
        {/* Optional Logo */}
        {/* <img src={require("../assets/logoSpp.PNG")} alt="Logo" className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-gray-800" /> */}
        <h3 className="text-2xl font-semibold text-white mb-1">Login</h3>
        <p className="text-gray-400 text-sm">
          Enter your credentials below to continue
        </p>
      </header>

      {/* Form */}
      <div className="px-6 py-6 bg-[#111827]">
        {error && (
          <div className="text-red-500 text-sm mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 text-sm mb-4 bg-green-500/10 border border-green-500/50 rounded-lg p-3">
            {success}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-[#1B2233] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3e6ff4] focus:border-[#3e6ff4]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-[#1B2233] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3e6ff4] focus:border-[#3e6ff4]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#4937BA] hover:opacity-90 disabled:opacity-60 text-white font-semibold shadow-md transition duration-150 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>

    {/* Links */}
    <div className="flex flex-col items-center gap-2 mt-4">
      <a
        href="#reset_password"
        className="text-sm text-white hover:text-[#3e6ff4] transition-colors"
      >
        Forgot password?
      </a>
      <p className="text-sm text-gray-400">
        Don't have an account?{" "}
        <a href="#register" className="text-[#3e6ff4] font-semibold hover:underline">
          Register
        </a>
      </p>
    </div>

    {/* Footer */}
    <footer className="flex justify-center items-center gap-2 mt-6 text-sm text-white/70">
      <p>© 2026 by Sendperplane</p>
      <a href="#privacy-policy" className="underline hover:text-[#3e6ff4]">
        Privacy
      </a>
    </footer>
  </div>
</section>
  )
}
