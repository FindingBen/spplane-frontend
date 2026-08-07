// ProductInfoBlock — Product name, category, share & favourite icons

export const ProductInfoPreview = ({ props = {} }) => (
  <div className="w-full px-3 pt-3 pb-2 bg-white">
    <div className="flex items-start justify-between">
      <div className="flex-1 pr-2">
        <h2 className="text-xs font-bold leading-tight" style={{ color: '#000000' }}>
          {props.name || 'Product Name'}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
          {props.category || ''}
        </p>
      </div>
      <div className="flex gap-2 mt-0.5">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>
    </div>
  </div>
)

export const ProductInfoEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Product Name</label>
      <input
        type="text"
        value={props.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Category / Subtitle</label>
      <input
        type="text"
        value={props.category || ''}
        onChange={(e) => onChange('category', e.target.value)}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
  </>
)
