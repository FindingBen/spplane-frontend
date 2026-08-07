import { useRef } from 'react'
import { useFirstCampaignGuide } from '../../guide/FirstCampaignGuideProvider'

// TextBlock — Simple paragraph content block

export const TextBlockPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const text = typeof props.text === 'string' ? props.text.trim() : ''

  return (
    <div className={isPublic ? 'w-full bg-white px-5 py-5 text-left' : 'w-full bg-white px-3 py-3 text-left'}>
      <p className={isPublic ? 'whitespace-pre-line text-[15px] leading-7 text-gray-700' : 'whitespace-pre-line text-[11px] leading-5 text-gray-700'}>
        {text || (isPublic ? '' : 'Add text to this block.')}
      </p>
    </div>
  )
}

export const TextBlockEditor = ({ props = {}, onChange }) => {
  const { currentStepId, trackAction } = useFirstCampaignGuide()
  const pendingGuideEditRef = useRef(false)

  const isGuideEditingStep = currentStepId === 'content-edit-text'

  const handleChange = (event) => {
    onChange('text', event.target.value)

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

    const nextValue = event.currentTarget.querySelector('textarea')?.value ?? ''
    if (!nextValue.trim()) {
      return
    }

    pendingGuideEditRef.current = false
    trackAction('content:text-edited')
  }

  return (
    <div data-guide-id="content-edit-text" onBlur={handleBlur}>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Text Content</label>
      <textarea
        rows={8}
        value={props.text || ''}
        onChange={handleChange}
        placeholder="Write your message here..."
        className="w-full resize-y rounded border border-[#3e6ff4]/20 bg-[#111827] px-3 py-2 text-xs text-white focus:border-[#3e6ff4]/60 focus:outline-none"
      />
      <p className="mt-2 text-[10px] text-[#CAC4CF]/60">Line breaks are preserved in the preview and public page.</p>
    </div>
  )
}