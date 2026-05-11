import { useRef } from 'react'
import { useFirstCampaignGuide } from '../../guide/FirstCampaignGuideProvider'

// CtaBlock — Full-width CTA button with style, size, and sticky options

const SIZE_CLASSES = {
  small: 'py-1.5 text-[10px]',
  medium: 'py-2 text-xs',
  large: 'py-3 text-sm',
}

const STYLE_CLASSES = {
  primary: 'bg-black text-white',
  secondary: 'bg-white text-black border-2 border-black',
  danger: 'bg-red-600 text-white',
  success: 'bg-green-700 text-white',
}

const PUBLIC_SIZE_CLASSES = {
  small: 'py-3 text-sm',
  medium: 'py-3.5 text-base',
  large: 'py-4 text-base',
}

export const CtaPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const sizeClass = isPublic
    ? (PUBLIC_SIZE_CLASSES[props.size] || PUBLIC_SIZE_CLASSES.large)
    : (SIZE_CLASSES[props.size] || SIZE_CLASSES.large)
  const styleClass = STYLE_CLASSES[props.style] || STYLE_CLASSES.primary

  return (
    <div className={`w-full bg-white ${isPublic ? 'px-5 py-4' : 'px-3 py-2'} ${props.sticky ? 'border-t-2 border-gray-200 shadow-lg' : ''}`}>
      {props.sticky && !isPublic && (
        <p className="text-[8px] text-gray-400 text-center mb-1 uppercase tracking-wide">Sticky Bar</p>
      )}
      <a
        href={props.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center font-bold ${isPublic ? 'rounded-2xl' : 'rounded-lg'} ${sizeClass} ${styleClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {props.text || 'Buy Now'}
      </a>
    </div>
  )
}

export const CtaEditor = ({ props = {}, onChange }) => {
  const { currentStepId, trackAction } = useFirstCampaignGuide()
  const pendingGuideEditRef = useRef(false)

  const isGuideEditingStep = currentStepId === 'content-edit-cta'

  const handleChange = (key, value) => {
    onChange(key, value)

    if (isGuideEditingStep) {
      pendingGuideEditRef.current = true
    }
  }

  const handleBlur = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }

    if (!isGuideEditingStep || !pendingGuideEditRef.current) {
      pendingGuideEditRef.current = false
      return
    }

    pendingGuideEditRef.current = false
    trackAction('content:cta-edited')
  }

  return (
    <div data-guide-id="content-edit-cta" onBlur={handleBlur} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Button Text</label>
        <input type="text" value={props.text || ''} onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Buy Now"
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Link URL</label>
        <input type="text" value={props.link || ''} onChange={(e) => handleChange('link', e.target.value)}
          placeholder="https://checkout.shopify.com/..."
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Style</label>
        <select value={props.style || 'primary'} onChange={(e) => handleChange('style', e.target.value)}
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60">
          <option value="primary">Primary (Black)</option>
          <option value="secondary">Secondary (White/Outlined)</option>
          <option value="danger">Danger (Red)</option>
          <option value="success">Success (Green)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Size</label>
        <select value={props.size || 'large'} onChange={(e) => handleChange('size', e.target.value)}
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer mt-1">
        <input type="checkbox" checked={props.sticky ?? true}
          onChange={(e) => handleChange('sticky', e.target.checked)}
          className="w-4 h-4 accent-[#3e6ff4]" />
        <span className="text-xs text-[#CAC4CF]">Sticky (fixed to bottom)</span>
      </label>
    </div>
  )
}
