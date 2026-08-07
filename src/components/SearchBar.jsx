import { useState } from 'react'

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      // Add your search logic here
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xs">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 pl-8 bg-[#111827] border border-[#3e6ff4]/30 rounded-lg text-xs text-[#CAC4CF] placeholder-[#23253a] focus:outline-none focus:ring-2 focus:ring-[#3e6ff4] focus:border-transparent transition-all duration-200"
        />
        <svg
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#23253a]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </form>
  )
}

export default SearchBar
