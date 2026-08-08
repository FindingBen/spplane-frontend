import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../service/interceptor/axiosInstance'
import { tokenService } from '../service/token/tokenService'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import SmsChart from '../components/charts/SmsChart'
import CampaignTracker from '../components/charts/CampaignTracker'
import CampaignSpendChart from '../components/charts/CampaignSpendChart'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'
import { getStatistics } from '../service/api/account'
import { getCampaignAnalytics } from '../service/api/campaign'

const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [stats, setStats] = useState({ active_campaigns: 0, sms_sent: 0, contacts: 0 })
  const [campaignAnalytics, setCampaignAnalytics] = useState()
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
    getStatistics()
      .then((data) => setStats(data))
      .catch(() => {})
    getCampaignAnalytics().then((data)=> setCampaignAnalytics(data.data)).catch(() => {})
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
        <div className="relative flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col">
          {/* Subtle notebook-style grid, confined to this panel only */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Main Content Area */}
          <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 xl:p-8 2xl:p-5">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="text-left max-w-2xl 2xl:max-w-xl">
              {/* Welcome Title */}
              <span className="text-2xl md:text-3xl xl:text-4xl 2xl:text-3xl font-bold text-white mb-6">
                Welcome to <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Sendperplane</span>
              </span>

              {/* Subtitle */}
              <p className="text-xs md:text-base lg:text-lg 2xl:text-sm text-[#CAC4CF] mb-8 md:mb-12 2xl:mb-8">
                Your dashboard is ready. Let's get started!
              </p>

              {/* Accent Line */}
              <div className="flex justify-start mb-8 md:mb-12 2xl:mb-8">
                <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-[#3e6ff4] to-transparent"></div>
              </div>

              {/* Quick Stats or Info (optional) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 2xl:gap-4 mb-8 md:mb-12 2xl:mb-8">
                <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-4 md:p-6 2xl:p-4 flex items-center gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[#3e6ff4]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-[#3e6ff4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl 2xl:text-lg font-bold text-[#3e6ff4] mb-1">{stats.active_campaigns ?? 0}</div>
                    <p className="text-[#CAC4CF] text-xs md:text-xs">Active Campaigns</p>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-4 md:p-6 2xl:p-4 flex items-center gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[#3e6ff4]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-[#3e6ff4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl 2xl:text-lg font-bold text-[#3e6ff4] mb-1">{stats.sms_sent ?? 0}</div>
                    <p className="text-[#CAC4CF] text-xs md:text-xs">Messages Sent</p>
                  </div>
                </div>
                <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-4 md:p-6 2xl:p-4 flex items-center gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[#3e6ff4]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-[#3e6ff4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl 2xl:text-lg font-bold text-[#3e6ff4] mb-1">{stats.contacts ?? 0}</div>
                    <p className="text-[#CAC4CF] text-xs md:text-xs">Total Recipients</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#3e6ff4]/25 bg-[#0f172a]/65 px-5 py-5 md:px-6 md:py-6 text-left shadow-[0_20px_45px_rgba(2,6,23,0.2)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">First Campaign Walkthrough</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">Need a guided path for the full SMS send flow?</h2>
                    <p className="mt-2 text-xs leading-6 text-[#CAC4CF]">{guideHelperText}</p>
                  </div>

                  <button
                    type="button"
                    onClick={openIntro}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {guideButtonLabel}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: stacked report widgets */}
            <div className="flex flex-col gap-4">
              {/* <SmsChart /> */}
              <CampaignTracker campaign={campaignAnalytics} />
              {/* <CampaignSpendChart /> */}
            </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Home
