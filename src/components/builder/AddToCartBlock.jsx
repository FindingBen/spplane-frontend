// AddToCartBlock — Chat icon button + Add to Cart button redirecting to checkout URL

export const AddToCartPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'

  return (
    <div className="w-full px-3 py-2 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 border-2 border-green-800 rounded-lg flex items-center justify-center flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
        <a
          href={props.checkoutUrl || '#'}
          {...(isPublic ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="flex-1 py-2 bg-green-800 text-white text-xs font-bold text-center rounded-lg"
          onClick={(e) => {
            e.stopPropagation()
            if (!isPublic) {
              e.preventDefault()
            }
          }}
        >
          {props.text || 'Add to Cart'}
        </a>
      </div>
    </div>
  )
}

export const AddToCartEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Button Text</label>
      <input
        type="text"
        value={props.text || ''}
        onChange={(e) => onChange('text', e.target.value)}
        placeholder="Add to Cart"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Checkout URL</label>
      <input
        type="text"
        value={props.checkoutUrl || ''}
        onChange={(e) => onChange('checkoutUrl', e.target.value)}
        placeholder="https://checkout.yourstore.com/..."
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <p className="text-xs text-[#CAC4CF]/60">User will be redirected to this URL immediately on tap.</p>
  </>
)
