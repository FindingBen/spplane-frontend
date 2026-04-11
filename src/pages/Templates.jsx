import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../service/interceptor/axiosInstance'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import TemplateModal from '../components/TemplateModal'

const Templates = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('api/content/templates/')
      setTemplates(response.data)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(t => t.category))]
      setCategories(uniqueCategories)
      
      setFilteredTemplates(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load templates')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category)
    
    if (category === 'all') {
      setFilteredTemplates(templates)
    } else {
      try {
        const response = await axiosInstance.get(`/api/templates/?category=${category}`)
        setFilteredTemplates(response.data)
      } catch (err) {
        console.error('Error filtering templates:', err)
      }
    }
  }

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template)
    setIsModalOpen(true)
  }

  const handleConfirmTemplate = (template) => {
    // Store selected template in localStorage
    localStorage.setItem('selectedTemplate', JSON.stringify(template))
    // Close modal
    setIsModalOpen(false)
    // Navigate to customizer (you can create this page later)
    // localStorage.setItem('selectedTemplate', JSON.stringify(template))
    // Navigate to editor/customizer page
    navigate('/content/templates/customize', { state: { template } })
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      {/* Top Bar - Full Width */}
      <TopBar />

      {/* Container for Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - No padding, extends to edges */}
        <Header />

        {/* Main Content Wrapper with Rounded Corners and Padding */}
        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-8 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">SMS Templates</span>
                </h1>
                <p className="text-lg text-[#CAC4CF]">
                  Choose from our predefined templates to create your SMS landing pages
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 mb-8 flex-wrap">
                <button
                  onClick={() => handleCategoryFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-[#3e6ff4] text-white'
                      : 'bg-[#1f2937] text-[#CAC4CF] border border-[#3e6ff4]/30 hover:border-[#3e6ff4]/60'
                  }`}
                >
                  All Templates
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                      selectedCategory === category
                        ? 'bg-[#3e6ff4] text-white'
                        : 'bg-[#1f2937] text-[#CAC4CF] border border-[#3e6ff4]/30 hover:border-[#3e6ff4]/60'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin mb-4">
                      <div className="w-12 h-12 border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] rounded-full"></div>
                    </div>
                    <p className="text-[#CAC4CF]">Loading templates...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4 mb-8">
                  <p>{error}</p>
                  <button
                    onClick={fetchTemplates}
                    className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Templates Grid */}
              {!loading && filteredTemplates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-lg overflow-hidden hover:border-[#3e6ff4]/60 hover:shadow-lg hover:shadow-[#3e6ff4]/20 transition-all duration-200 cursor-pointer group"
                    >
                      {/* Template Thumbnail */}
                      <div className="relative h-48 bg-[#111827] overflow-hidden">
                        {template.thumbnail_url ? (
                          <img
                            src={template.thumbnail_url}
                            alt={template.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-[#3e6ff4]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                        <p className="text-[#CAC4CF] text-sm mb-3 line-clamp-2">
                          {template.description || 'SMS landing page template'}
                        </p>

                        {/* Category Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-[#3e6ff4]/20 text-[#3e6ff4] rounded capitalize">
                            {template.category}
                          </span>
                          <span className="text-xs text-[#CAC4CF]">
                            {template.structure?.components?.length || 0} components
                          </span>
                        </div>

                        {/* Select Button */}
                        <button className="w-full mt-4 px-4 py-2 bg-[#3e6ff4] hover:bg-[#3e6ff4]/90 text-white rounded-lg font-medium transition-colors group-hover:bg-[#3e6ff4]/90">
                          Select Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-16 h-16 text-[#3e6ff4]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-white font-semibold mb-2">No templates found</h3>
                  <p className="text-[#CAC4CF]">Try selecting a different category</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>


      <TemplateModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmTemplate}
      />
    </div>
  )
}


export default Templates
