// ProductDetailsBlock — Price, brand, and location pills row

export const ProductDetailsPreview = ({ props = {} }) => (
  <div className="w-full px-3 py-2 bg-white">
    <div className="flex items-center gap-3 flex-wrap">
      {props.price && (
        <div className="flex items-center gap-1">
          <span className="text-xs">💰</span>
          <span className="text-xs text-green-700 font-medium">{props.price}</span>
        </div>
      )}
      {props.brand && (
        <div className="flex items-center gap-1">
          <span className="text-xs">🏷️</span>
          <span className="text-xs text-gray-600">{props.brand}</span>
        </div>
      )}
      {props.location && (
        <div className="flex items-center gap-1">
          <span className="text-xs">📍</span>
          <span className="text-xs text-gray-600">{props.location}</span>
        </div>
      )}
    </div>
  </div>
)

export const ProductDetailsEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Price</label>
      <input
        type="text"
        value={props.price || ''}
        onChange={(e) => onChange('price', e.target.value)}
        placeholder="$29.99"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Brand</label>
      <input
        type="text"
        value={props.brand || ''}
        onChange={(e) => onChange('brand', e.target.value)}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Location</label>
      <input
        type="text"
        value={props.location || ''}
        onChange={(e) => onChange('location', e.target.value)}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
  </>
)
