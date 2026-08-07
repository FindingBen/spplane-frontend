const formatDisplayedPrice = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `$${value.toFixed(2)}`
  }

  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  return trimmedValue.startsWith('$') ? trimmedValue : `$${trimmedValue}`
}

export const PricePreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const price = formatDisplayedPrice(props.price || props.amount || props.text)

  return (
    <div className={isPublic ? 'w-full bg-black px-5 py-5 text-center' : 'w-full bg-black px-3 py-3 text-center'}>
      <p className={isPublic ? 'text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60' : 'text-[8px] font-semibold uppercase tracking-[0.18em] text-white/60'}>Price</p>
      <p className={isPublic ? 'mt-2 text-2xl font-bold text-white' : 'mt-1 text-base font-bold text-white'}>{price || '$0.00'}</p>
    </div>
  )
}

export const PriceEditor = ({ props = {}, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Price</label>
    <input
      type="text"
      value={props.price || ''}
      onChange={(event) => onChange('price', event.target.value)}
      placeholder="59.00"
      className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
    />
    <p className="mt-2 text-[10px] text-[#CAC4CF]/60">Dollar formatting is added automatically if you omit the symbol.</p>
  </div>
)