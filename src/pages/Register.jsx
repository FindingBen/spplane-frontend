import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../service/api/auth'

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await register(email, password, 'regular')

      setSuccess('Account created! Please check your email to verify your account.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0A0E1A] text-gray-200 p-4">
      <div className="w-full max-w-[360px]">
        <div className="bg-[#111827] border-2 border-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <header className="text-center px-5 py-6 bg-[#1B2233]">
            <h3 className="text-xl font-semibold text-white mb-1">Create an Account</h3>
            <p className="text-gray-400 text-xs">Fill in the details below to get started</p>
          </header>

          {/* Form */}
          <div className="px-6 py-6 bg-[#111827]">
            {error && (
              <div className="text-red-500 text-xs mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-500 text-xs mb-4 bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                {success}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-2">Email</label>
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
                <label className="block text-gray-300 text-xs font-medium mb-2">Password</label>
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

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-[#1B2233] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3e6ff4] focus:border-[#3e6ff4]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#4937BA] hover:opacity-90 disabled:opacity-60 text-white font-semibold shadow-md transition duration-150 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3e6ff4] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="flex justify-center items-center gap-2 mt-6 text-xs text-white/70">
          <p>© 2026 by Sendperplane</p>
          <a href="#privacy-policy" className="underline hover:text-[#3e6ff4]">
            Privacy
          </a>
        </footer>
      </div>
    </section>
  )
}
