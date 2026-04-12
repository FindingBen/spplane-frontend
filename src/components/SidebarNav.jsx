import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SidebarNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isContentOpen, setIsContentOpen] = useState(false)

  // Auto-open Content if on content pages
  React.useEffect(() => {
    if (location.pathname.startsWith('/content')) {
      setIsContentOpen(true)
    }
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="w-full px-4 flex-1 flex flex-col">
      {/* Home */}
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full text-left px-3 py-3 mt-6 text-[#CAC4CF] hover:bg-[#3e6ff4]/20 rounded-lg transition-colors duration-200 flex items-center gap-3 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-10m0 0l4 10" />
        </svg>
        Home
      </button>

      {/* Content with Dropdown */}
      <div className="mt-4">
        <button
          onClick={() => setIsContentOpen(!isContentOpen)}
          className="w-full text-left px-3 py-3 text-[#CAC4CF] hover:bg-[#3e6ff4]/20 rounded-lg transition-colors duration-200 flex items-center justify-between font-medium group"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .267M7 21H5a2 2 0 01-2-2v-4a2 2 0 012-2h2.5" />
            </svg>
            Content
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isContentOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {/* Dropdown Items */}
        {isContentOpen && (
          <div className="ml-6 mt-2 space-y-2">
            <button
              onClick={() => navigate('/content/builder')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isActive('/content/builder')
                  ? 'bg-[#3e6ff4]/30 text-[#60a5fa] font-semibold'
                  : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${isActive('/content/builder') ? 'bg-[#60a5fa]' : 'bg-[#3e6ff4]'}`}></div>
              Create
            </button>
            <button
              onClick={() => navigate('/content/templates')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isActive('/content/templates')
                  ? 'bg-[#3e6ff4]/30 text-[#60a5fa] font-semibold'
                  : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${isActive('/content/templates') ? 'bg-[#60a5fa]' : 'bg-[#3e6ff4]'}`}></div>
              Templates
            </button>
            <button
              onClick={() => navigate('/content/products')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isActive('/content/products')
                  ? 'bg-[#3e6ff4]/30 text-[#60a5fa] font-semibold'
                  : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${isActive('/content/products') ? 'bg-[#60a5fa]' : 'bg-[#3e6ff4]'}`}></div>
              Products
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default SidebarNav
