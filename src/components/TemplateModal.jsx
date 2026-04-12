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
  console.log('TEMMM',template)
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
          <div className="flex items-center justify-between p-3 border-b border-[#3e6ff4]/20">
            <div>
              <h2 className="text-2xl font-bold text-white">{template.name}</h2>
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

          {/* Content - Full width preview */}
          <div className="flex-1 overflow-hidden flex flex-col">
           
       
            <div className="flex-1 bg-[#111827] flex items-center justify-center p-3 overflow-hidden">
              <div className="flex flex-col items-center gap-4 h-full">
                {/* iPhone 12 Mockup - Flowbite style */}
                <div className="relative mx-auto border-[14px] bg-gray-900 border-gray-900 rounded-[2.5rem] h-[500px] w-[260px] shadow-2xl">
                  {/* Left side buttons */}
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[130px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[170px] rounded-s-lg"></div>
                  
                  {/* Right side button */}
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[138px] rounded-e-lg"></div>
                  
                  {/* Notch */}
                  <div className="w-[120px] h-[28px] bg-gray-900 rounded-b-[1.25rem] absolute top-0 left-1/2 -translate-x-1/2 z-10"></div>
                  
                  {/* Screen content */}
                  <div className="rounded-[2rem] overflow-hidden w-[232px] h-[472px] bg-white overflow-y-auto flex flex-col">
                    <TemplatePreview template={template} />
                  </div>
                </div>

                <p className="text-xs text-[#CAC4CF] text-center">
                  Mobile preview (as users will see on SMS)
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#3e6ff4]/20 p-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-[#1f2937] border border-[#3e6ff4]/30 text-white rounded-lg hover:bg-[#111827] transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(template)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
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
  const blocks = template?.structure?.blocks

  if (!blocks?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No template content available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {blocks.map((block, idx) => (
        <TemplateBlock key={idx} block={block} />
      ))}
    </div>
  )
}

// Block renderer for template preview — matches ContentBuilder block types
const TemplateBlock = ({ block }) => {
  const { type, props = {} } = block

  switch (type) {
    case 'video-hero':
      return (
        <div className="w-full relative">
          {props.fallbackImage ? (
            <img src={props.fallbackImage} alt={props.title || 'Video'} className="w-full h-36 object-cover" />
          ) : (
            <div className="w-full h-36 bg-gray-900 flex items-center justify-center">
              <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1" />
              </div>
            </div>
          )}
          {props.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-xs font-semibold">{props.title}</p>
            </div>
          )}
        </div>
      )

    case 'product-bundle':
      return (
        <div className="w-full px-3 py-3 bg-white">
          {props.title && <p className="text-xs font-bold text-black mb-1">{props.title}</p>}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(props.products || []).map((p, idx) => (
              <div key={idx} className="flex-shrink-0 w-20 bg-gray-50 rounded border border-gray-200 overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-14 object-cover" />
                ) : (
                  <div className="w-full h-14 bg-gray-200 flex items-center justify-center">
                    <span className="text-[9px] text-gray-400">No image</span>
                  </div>
                )}
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-black truncate">{p.name}</p>
                  <p className="text-[10px] text-green-700">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
          {props.bundleCtaText && (
            <div className="w-full mt-2 py-1.5 bg-black text-white text-[10px] font-bold text-center rounded">{props.bundleCtaText}</div>
          )}
        </div>
      )

    case 'comparison-table':
      return (
        <div className="w-full px-3 py-2 bg-white">
          {props.title && <p className="text-xs font-bold text-black mb-1">{props.title}</p>}
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-1 py-1 text-gray-600">Feature</th>
                <th className="text-center px-1 py-1 text-green-700">Us</th>
                <th className="text-center px-1 py-1 text-gray-500">Them</th>
              </tr>
            </thead>
            <tbody>
              {(props.comparisons || []).map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-1 py-0.5 text-black">{row.feature}</td>
                  <td className="px-1 py-0.5 text-green-700 text-center">{row.us}</td>
                  <td className="px-1 py-0.5 text-gray-500 text-center">{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'inventory-tracker': {
      const msg = (props.messageTemplate || 'Only {remaining} left in stock!').replace('{remaining}', 3)
      return (
        <div className="w-full px-3 py-2 bg-orange-50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <p className="text-[10px] font-semibold text-orange-600">{msg}</p>
        </div>
      )
    }

    case 'social-proof':
      return (
        <div className="w-full px-3 py-2 bg-white">
          {props.title && <p className="text-xs font-bold text-black mb-1">{props.title}</p>}
          {(props.reviews || []).slice(0, 1).map((r, idx) => (
            <div key={idx} className="bg-gray-50 rounded p-1.5 border border-gray-100">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: r.rating || 5 }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-[10px]">★</span>
                ))}
              </div>
              <p className="text-[10px] text-gray-700">"{r.text}"</p>
              <p className="text-[9px] text-gray-500 mt-0.5 font-semibold">— {r.author}</p>
            </div>
          ))}
        </div>
      )

    case 'countdown-timer': {
      return (
        <div className="w-full px-3 py-2 bg-white">
          {props.title && <p className="text-[10px] font-bold text-black text-center mb-1">{props.title}</p>}
          <div className="flex justify-center gap-1">
            {[{ l: 'Days', v: '03' }, { l: 'Hrs', v: '14' }, { l: 'Min', v: '22' }, { l: 'Sec', v: '--' }].map(({ l, v }) => (
              <div key={l} className="flex flex-col items-center bg-red-600 text-white rounded px-1.5 py-1 min-w-[28px]">
                <span className="text-xs font-bold leading-tight">{v}</span>
                <span className="text-[7px] uppercase">{l}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'cta': {
      const sizeClass = props.size === 'small' ? 'py-1' : props.size === 'medium' ? 'py-1.5' : 'py-2'
      const styleClass = props.style === 'secondary' ? 'bg-white text-black border-2 border-black'
        : props.style === 'danger' ? 'bg-red-600 text-white'
        : props.style === 'success' ? 'bg-green-700 text-white'
        : 'bg-black text-white'
      return (
        <div className={`w-full px-3 py-2 bg-white ${props.sticky ? 'border-t-2 border-gray-200' : ''}`}>
          <div className={`w-full text-center font-bold rounded-lg text-xs ${sizeClass} ${styleClass}`}>
            {props.text || 'Buy Now'}
          </div>
        </div>
      )
    }

    default:
      return null
  }
}

export default TemplateModal
