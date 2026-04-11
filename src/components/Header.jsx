import SidebarNav from './SidebarNav'

const Header = () => {
  return (
    <aside className="w-42 h-full bg-gradient-to-b from-[#1f2937] to-[#111827] border-r border-[#3e6ff4]/30 flex flex-col flex-shrink-0">
      {/* Navigation */}
      <SidebarNav />
    </aside>
  )
}

export default Header