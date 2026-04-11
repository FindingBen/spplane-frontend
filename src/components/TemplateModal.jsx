import { useEffect } from 'react'

const TemplateModal = ({ template, isOpen, onClose, onConfirm }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen || !template) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3e6ff4]/20">
            <div>
              <h2 className="text-2xl font-bold text-white">{template.name}</h2>
              <p className="text-sm text-[#CAC4CF] mt-1 capitalize">{template.category} Template</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#111827] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-[#CAC4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Split layout */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Info Section */}
            <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-[#3e6ff4]/20 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#CAC4CF] uppercase mb-2">Description</h3>
                  <p className="text-white">{template.description || 'No description available'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#CAC4CF] uppercase mb-2">Components</h3>
                  <div className="space-y-2">
                    {template.structure?.components?.map((component, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-[#111827] rounded"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#3e6ff4]"></span>
                        <span className="text-sm text-white capitalize">
                          {component.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#CAC4CF] uppercase mb-2">Stats</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-[#111827] rounded">
                      <p className="text-xs text-[#CAC4CF]">Components</p>
                      <p className="text-lg font-bold text-[#3e6ff4]">
                        {template.structure?.components?.length || 0}
                      </p>
                    </div>
                    <div className="p-2 bg-[#111827] rounded">
                      <p className="text-xs text-[#CAC4CF]">Category</p>
                      <p className="text-lg font-bold text-[#3e6ff4] capitalize">
                        {template.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Preview Section */}
            <div className="flex-1 bg-[#111827] flex items-center justify-center p-6 overflow-hidden">
              <div className="flex flex-col items-center gap-4 h-full">
                {/* Mobile Frame */}
                <div className="flex-1 flex items-center justify-center max-w-sm w-full">
                  <div className="bg-white rounded-3xl shadow-2xl border-8 border-gray-800 w-full max-w-sm overflow-hidden flex flex-col h-full">
                    {/* Phone Notch */}
                    <div className="bg-gray-900 h-6 flex items-center justify-center">
                      <div className="bg-gray-900 h-5 w-32 rounded-b-2xl"></div>
                    </div>

                    {/* Phone Screen - Scrollable Content */}
                    <div className="flex-1 overflow-y-auto bg-white">
                      <TemplatePreview template={template} />
                    </div>

                    {/* Phone Home Indicator */}
                    <div className="bg-gray-900 h-6 flex items-center justify-center">
                      <div className="h-1 w-32 bg-gray-800 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#CAC4CF] text-center">
                  Mobile preview (as users will see on SMS)
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#3e6ff4]/20 p-6 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#1f2937] border border-[#3e6ff4]/30 text-white rounded-lg hover:bg-[#111827] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(template)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Template Preview Component that renders the template structure
const TemplatePreview = ({ template }) => {
  if (!template?.structure?.components) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No template content available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {template.structure.components.map((component, idx) => (
        <TemplateComponent key={idx} component={component} />
      ))}
    </div>
  )
}

// Component renderer for different template element types
const TemplateComponent = ({ component }) => {
  const { type, props = {} } = component

  switch (type) {
    case 'hero':
      return (
        <div className="w-full bg-gradient-to-b from-[#3e6ff4] to-[#1e40af] text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{props.title || 'Welcome'}</h1>
          <p className="text-sm mb-4 text-white/80">{props.subtitle || ''}</p>
          {props.btnText && (
            <button className="bg-white text-[#3e6ff4] px-4 py-2 rounded-lg font-semibold">
              {props.btnText}
            </button>
          )}
        </div>
      )

    case 'carousel':
      return (
        <div className="w-full p-4 bg-gradient-to-b from-white to-gray-50">
          <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center mb-4">
            <span className="text-gray-400 text-sm">
              Carousel ({props.items?.length || 0} items)
            </span>
          </div>
        </div>
      )

    case 'cta_button':
      return (
        <div className="w-full p-4 text-center">
          <button
            className="w-11/12 py-3 rounded-lg font-semibold text-white"
            style={{
              backgroundColor: props.color || '#3e6ff4',
            }}
          >
            {props.text || 'Call to Action'}
          </button>
        </div>
      )

    case 'text':
      return (
        <div className="w-full p-4 text-gray-700">
          <p>{props.content || 'Text content'}</p>
        </div>
      )

    case 'image':
      return (
        <div className="w-full p-4 bg-gray-100 flex items-center justify-center h-32">
          {props.url ? (
            <img src={props.url} alt="Content" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">Image placeholder</span>
          )}
        </div>
      )

    case 'form_field':
      return (
        <div className="w-full p-4">
          <input
            type={props.type || 'text'}
            placeholder={props.placeholder || 'Enter text'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled
          />
        </div>
      )

    case 'divider':
      return <div className="w-full border-b border-gray-200" />

    default:
      return (
        <div className="w-full p-4 bg-gray-100 text-gray-500 text-center text-sm">
          <p>Component type: {type}</p>
        </div>
      )
  }
}

export default TemplateModal
