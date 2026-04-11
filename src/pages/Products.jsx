import Header from '../components/Header'
import TopBar from '../components/TopBar'

const Products = () => {
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
          <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto overflow-x-hidden">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Your Products</span>
              </h1>
              <p className="text-lg text-[#CAC4CF] mb-12">
                Overview of your SMS products and campaigns
              </p>
              
              {/* Empty State */}
              <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg p-12 max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#3e6ff4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-white font-semibold mb-2">No Products Yet</h3>
                <p className="text-[#CAC4CF] text-sm">You haven't created any products yet. Start by creating your first SMS product.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Products
