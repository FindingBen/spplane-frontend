// ProductImageBlock — Hero product image with back arrow and carousel dots

export const ProductImagePreview = ({ props = {} }) => (
  <div className="w-full relative">
    {props.image ? (
      <img src={props.image} alt="Product" className="w-full h-40 object-cover" />
    ) : (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
        <span className="text-xs text-gray-400">Product Image</span>
      </div>
    )}
    {/* Back arrow */}
    <div className="absolute top-2 left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow">
      <span className="text-xs text-black font-bold">←</span>
    </div>
    {/* Carousel dots */}
    <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1">
      <div className="w-4 h-1 bg-green-800 rounded-full"></div>
      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
    </div>
  </div>
)

export const ProductImageEditor = ({ props = {}, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Product Image URL</label>
    <input
      type="text"
      value={props.image || ''}
      onChange={(e) => onChange('image', e.target.value)}
      placeholder="https://..."
      className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
    />
  </div>
)
