import { useNavigate } from 'react-router-dom'
import UserDropdown from './UserDropdown'
import SearchBar from './SearchBar'
import WalletCreditsPill from './WalletCreditsPill'
import noBgLogo from '../assets/icon_transparent.png'

const TopBar = () => {
  const navigate = useNavigate()

  return (
    <nav className="w-full h-14 md:h-16 border-b border-[#3e6ff4]/35 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(17,24,39,0.78))] flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-4 lg:gap-8 flex-shrink-0">
      {/* Logo and Title - Left side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <img 
          src={noBgLogo} 
          alt="Sendperplane Logo" 
          className="h-9 md:h-14 w-auto"
        />
        <span className="text-white font-bold text-sm lg:text-base">Sendperplane</span>
      </div>
      
      {/* Search Bar - Center */}
      {/* <SearchBar /> */}
      
      {/* User Actions - Right side */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => navigate('/sms-plans')}
          className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#3e6ff4]/35 bg-[#0B1619] cursor-pointer px-3.5 py-1.5 text-xs font-semibold text-[#dbeafe] transition-all hover:text-white"
        >
          Top up
        </button>
        <WalletCreditsPill />
        <UserDropdown />
      </div>
    </nav>
  )
}

export default TopBar
