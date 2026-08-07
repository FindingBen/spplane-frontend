import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { shopifyCompleteSetup } from '../service/api/auth'
import { tokenService } from '../service/token/tokenService'

export default function SetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const setupToken = searchParams.get('setup_token') || ''
  const email = searchParams.get('email') || ''
  const shop = searchParams.get('shop') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Guard: if required params are missing, show an error immediately
  if (!setupToken || !email) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0A0E1A] text-gray-200 p-4">
        <div className="w-full max-w-[360px]">
          <div className="bg-[#111827] border-2 border-red-800 rounded-2xl shadow-lg p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Invalid Setup Link</p>
            <p className="text-gray-400 text-xs">
              This link is missing required parameters. Please reinstall the Shopify app to get a
              new link.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const data = await shopifyCompleteSetup(setupToken, password)

      if (data.token && data.refresh) {
        tokenService.setTokens({ access: data.token, refresh: data.refresh })
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Setup failed. Please try again.')
      console.error('SetPassword error:', err)
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
            <h3 className="text-xl font-semibold text-white mb-1">Set Your Password</h3>
            <p className="text-gray-400 text-xs">
              {shop ? `Completing setup for ${shop}` : 'Complete your account setup'}
            </p>
          </header>

          {/* Form */}
          <div className="px-6 py-6 bg-[#111827]">
            {/* Shop info banner */}
            <div className="text-blue-400 text-xs mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              Signing in as <span className="font-semibold">{email}</span>
              {shop && (
                <>
                  {' '}from <span className="font-semibold">{shop}</span>
                </>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-xs mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email — read-only, autofilled from URL */}
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2 rounded-xl bg-[#1B2233] text-gray-400 cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 8 characters)"
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
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </form>
          </div>
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
