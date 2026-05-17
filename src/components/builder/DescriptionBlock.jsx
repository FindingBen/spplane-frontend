// DescriptionBlock — Supporting description copy with a softer background.

const getDescriptionContent = (props = {}) => {
  if (typeof props.content === 'string' && props.content.trim()) {
    return props.content.trim()
  }

  if (typeof props.text === 'string' && props.text.trim()) {
    return props.text.trim()
  }

  return ''
}

export const DescriptionPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const heading = typeof props.heading === 'string' ? props.heading.trim() : ''
  const content = getDescriptionContent(props)

  return (
    <div className={isPublic ? 'w-full bg-[#f3f4f6] px-5 py-5 text-left' : 'w-full bg-[#f3f4f6] px-3 py-3 text-left'}>
      {heading && (
        <h3 className={isPublic ? 'mb-2 text-base font-semibold text-gray-900' : 'mb-1 text-xs font-semibold text-gray-900'}>{heading}</h3>
      )}
      <p className={isPublic ? 'whitespace-pre-line text-[15px] leading-7 text-gray-700' : 'whitespace-pre-line text-[11px] leading-5 text-gray-700'}>
        {content || (isPublic ? '' : 'Add description text to this block.')}
      </p>
    </div>
  )
}

export const DescriptionEditor = ({ props = {}, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Section Heading</label>
      <input
        type="text"
        value={props.heading || ''}
        onChange={(event) => onChange('heading', event.target.value)}
        placeholder="Optional heading"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Description Text</label>
      <textarea
        value={props.content || props.text || ''}
        onChange={(event) => onChange('content', event.target.value)}
        rows="6"
        className="w-full resize-y rounded border border-[#3e6ff4]/20 bg-[#111827] px-3 py-2 text-sm text-white focus:border-[#3e6ff4]/60 focus:outline-none"
      />
    </div>
  </div>
)
