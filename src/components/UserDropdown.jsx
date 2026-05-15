import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokenService } from '../service/token/tokenService'

const UserDropdown = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    tokenService.clear()
    navigate('/login')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3e6ff4]/20 to-[#60a5fa]/20 border text-[#dbeafe] shadow-[0_0_0_1px_rgba(62,111,244,0.1)] transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-[#60a5fa]/80 from-[#3e6ff4]/30 to-[#60a5fa]/30'
            : 'border-[#3e6ff4]/40 hover:border-[#60a5fa]/70 hover:from-[#3e6ff4]/30 hover:to-[#60a5fa]/30'
        }`}
        title="Open profile menu"
        aria-label="Open profile menu"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] flex items-center justify-center text-white text-xs font-semibold shadow-[0_0_8px_rgba(96,165,250,0.45)]">
          U
        </div>
        <span className="text-[11px] uppercase tracking-wide text-[#bfdbfe]/90 hidden sm:inline">Profile</span>
        <svg
          className={`w-4 h-4 text-[#bfdbfe]/90 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg shadow-lg z-50">
          {/* Profile Settings */}
          {/* <button
            onClick={() => {
              navigate('/profile')
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-3 text-[#CAC4CF] hover:bg-[#111827] transition-colors duration-200 rounded-t-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button> */}

          {/* Separator */}
          <div className="border-t border-[#3e6ff4]/20"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#111827] transition-colors duration-200 rounded-b-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserDropdown
