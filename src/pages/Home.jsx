import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../service/interceptor/axiosInstance'
import { tokenService } from '../service/token/tokenService'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const { active, completed, currentStep, openIntro } = useFirstCampaignGuide()

  const guideButtonLabel = active
    ? 'Continue first campaign guide'
    : completed
      ? 'Run the first campaign guide again'
      : 'Guide me through my first campaign'

  const guideHelperText = active
    ? `Current step: ${currentStep?.title ?? 'Continue where you left off.'}`
    : 'Follow the full flow from content creation to cost review and final send.'

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/api/accounts/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleLogout = () => {
    tokenService.clear()
    navigate('/login')
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      {/* Top Bar - Full Width */}
      <TopBar />

      {/* Container for Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Sidebar - No padding, extends to edges */}
        <Header />

        {/* Main Content Wrapper with Rounded Corners and Padding */}
        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col">
          {/* Main Content Area */}
          <main className="flex-1 flex items-center justify-center p-4 md:p-6 xl:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="text-center max-w-2xl 2xl:max-w-xl">
              {/* Welcome Title */}
              <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-4xl font-bold text-white mb-6">
                Welcome to <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Sendperplane</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm md:text-lg lg:text-xl 2xl:text-base text-[#CAC4CF] mb-8 md:mb-12 2xl:mb-8">
                Your dashboard is ready. Let's get started!
              </p>

              {/* Accent Line */}
              <div className="flex justify-center mb-8 md:mb-12 2xl:mb-8">
                <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-transparent via-[#3e6ff4] to-transparent"></div>
              </div>

              {/* Quick Stats or Info (optional) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 2xl:gap-4 mb-8 md:mb-12 2xl:mb-8">
                <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-4 md:p-6 2xl:p-4">
                  <div className="text-2xl md:text-3xl 2xl:text-xl font-bold text-[#3e6ff4] mb-2">0</div>
                  <p className="text-[#CAC4CF] text-xs md:text-sm">Active Campaigns</p>
                </div>
                <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-4 md:p-6 2xl:p-4">
                  <div className="text-2xl md:text-3xl 2xl:text-xl font-bold text-[#3e6ff4] mb-2">0</div>
                  <p className="text-[#CAC4CF] text-xs md:text-sm">Messages Sent</p>
                </div>
                <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-4 md:p-6 2xl:p-4">
                  <div className="text-2xl md:text-3xl 2xl:text-xl font-bold text-[#3e6ff4] mb-2">0</div>
                  <p className="text-[#CAC4CF] text-xs md:text-sm">Total Users</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#3e6ff4]/25 bg-[#0f172a]/65 px-5 py-5 md:px-6 md:py-6 text-left shadow-[0_20px_45px_rgba(2,6,23,0.2)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">First Campaign Walkthrough</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Need a guided path for the full SMS send flow?</h2>
                    <p className="mt-2 text-sm leading-6 text-[#CAC4CF]">{guideHelperText}</p>
                  </div>

                  <button
                    type="button"
                    onClick={openIntro}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {guideButtonLabel}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="px-4 md:px-6 2xl:px-5 py-2 md:py-3 2xl:py-2 text-sm md:text-base 2xl:text-sm bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Home
