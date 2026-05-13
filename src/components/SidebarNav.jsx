import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

const SidebarNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isContentOpen, setIsContentOpen] = useState(false)
  const { currentTargetId, trackAction } = useFirstCampaignGuide()

  // Auto-open Content if on content pages
  React.useEffect(() => {
    if (location.pathname.startsWith('/content') || currentTargetId === 'nav-content-builder') {
      setIsContentOpen(true)
    }
  }, [currentTargetId, location.pathname])

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

      {/* Campaigns */}
      <button
        onClick={() => {
          trackAction('nav:campaigns')
          navigate('/campaigns')
        }}
        data-guide-id="nav-campaigns"
        className={`w-full text-left px-3 py-3 mt-2 rounded-lg transition-colors duration-200 flex items-center gap-3 font-medium ${
          isActive('/campaigns')
            ? 'bg-[#3e6ff4]/30 text-[#60a5fa]'
            : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        Campaigns
      </button>

      {/* Audience */}
      <button
        onClick={() => {
          trackAction('nav:audience')
          navigate('/audience')
        }}
        data-guide-id="nav-audience"
        className={`w-full text-left px-3 py-3 mt-2 rounded-lg transition-colors duration-200 flex items-center gap-3 font-medium ${
          isActive('/audience')
            ? 'bg-[#3e6ff4]/30 text-[#60a5fa]'
            : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Audience
      </button>

      {/* Customers */}
      <button
        onClick={() => {
          trackAction('nav:customers')
          navigate('/customers')
        }}
        data-guide-id="nav-customers"
        className={`w-full text-left px-3 py-3 mt-2 rounded-lg transition-colors duration-200 flex items-center gap-3 font-medium ${
          isActive('/customers')
            ? 'bg-[#3e6ff4]/30 text-[#60a5fa]'
            : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Customers
      </button>

      {/* SMS */}
      <button
        onClick={() => {
          trackAction('nav:sms')
          navigate('/sms')
        }}
        data-guide-id="nav-sms"
        className={`w-full text-left px-3 py-3 mt-2 rounded-lg transition-colors duration-200 flex items-center gap-3 font-medium ${
          isActive('/sms')
            ? 'bg-[#3e6ff4]/30 text-[#60a5fa]'
            : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        SMS
      </button>

      <button
        onClick={() => navigate('/sms-plans')}
        className={`w-full text-left px-3 py-3 mt-2 rounded-lg transition-colors duration-200 flex items-center gap-3 font-medium ${
          isActive('/sms-plans')
            ? 'bg-[#3e6ff4]/30 text-[#60a5fa]'
            : 'text-[#CAC4CF] hover:bg-[#3e6ff4]/20'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2m-2 0h14a1 1 0 011 1v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a1 1 0 011-1zm7 4h.01" />
        </svg>
        Top up
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
              onClick={() => {
                trackAction('nav:content-builder')
                navigate('/content/builder')
              }}
              data-guide-id="nav-content-builder"
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
