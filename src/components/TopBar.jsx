import UserDropdown from './UserDropdown'
import SearchBar from './SearchBar'
import noBgLogo from '../assets/noBgLogo.png'

const TopBar = () => {
  return (
    <nav className="w-full h-16 bg-gradient-to-r from-[#1f2937] to-[#111827] border-b border-[#3e6ff4]/30 flex items-center justify-between px-8 gap-8 flex-shrink-0">
      {/* Logo and Title - Left side */}
      <div className="flex items-center gap-3">
        <img 
          src={noBgLogo} 
          alt="Sendperplane Logo" 
          className="h-8 w-auto"
        />
        <span className="text-white font-bold text-lg">Sendperplane</span>
      </div>
      
      {/* Search Bar - Center */}
      <SearchBar />
      
      {/* User Dropdown - Right side */}
      <UserDropdown />
    </nav>
  )
}

export default TopBar
