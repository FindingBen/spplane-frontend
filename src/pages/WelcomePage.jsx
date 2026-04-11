import React,{useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../service/interceptor/axiosInstance'
import { tokenService } from '../service/token/tokenService'
import Header from '../components/Header'
import TopBar from '../components/TopBar'

const WelcomePage = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState({})

    useEffect(() =>{
        fetchUserData()
    },[])

    const fetchUserData = async () => {
        try {
            const response = await axiosInstance.get('/api/accounts/me/');
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
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
          <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
        {/* Welcome Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Welcome to <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Sendperplane</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#CAC4CF] mb-12">
          Your dashboard is ready. Let's get started!
        </p>

        {/* Accent Line */}
        <div className="flex justify-center mb-12">
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#3e6ff4] to-transparent"></div>
        </div>

        {/* Quick Stats or Info (optional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#3e6ff4] mb-2">0</div>
            <p className="text-[#CAC4CF] text-sm">Active Campaigns</p>
          </div>
          <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#3e6ff4] mb-2">0</div>
            <p className="text-[#CAC4CF] text-sm">Messages Sent</p>
          </div>
          <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#3e6ff4] mb-2">0</div>
            <p className="text-[#CAC4CF] text-sm">Total Users</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-200"
        >
          Logout
        </button>
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage