const getTaglineText = (props = {}) => {
  if (typeof props.text === 'string' && props.text.trim()) {
    return props.text.trim()
  }

  if (typeof props.label === 'string' && props.label.trim()) {
    return props.label.trim()
  }

  return ''
}

export const TaglinePreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const text = getTaglineText(props)

  return (
    <div className={isPublic ? 'w-full bg-white px-5 pb-2 pt-5 text-left' : 'w-full bg-white px-3 pb-2 pt-3 text-left'}>
      <p className={isPublic ? 'text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500' : 'text-[8px] font-semibold uppercase tracking-[0.18em] text-gray-500'}>
        {text || 'Tagline'}
      </p>
    </div>
  )
}

export const TaglineEditor = ({ props = {}, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Tagline Text</label>
    <input
      type="text"
      value={props.text || ''}
      onChange={(event) => onChange('text', event.target.value)}
      placeholder="Trusted by thousands"
      className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
    />
  </div>
)