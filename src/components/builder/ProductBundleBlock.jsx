// ProductBundleBlock — Horizontal product cards with bundle CTA

export const ProductBundlePreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'

  return (
    <div className={isPublic ? 'w-full px-5 py-5 bg-white' : 'w-full px-3 py-3 bg-white'}>
      {props.title && <h3 className={isPublic ? 'text-base font-bold text-black text-left mb-1' : 'text-xs font-bold text-black mb-0.5'}>{props.title}</h3>}
      {props.subtitle && <p className={isPublic ? 'text-xs text-gray-500 text-left mb-4' : 'text-[10px] text-gray-500 mb-2'}>{props.subtitle}</p>}
      <div className={isPublic ? 'flex gap-3 overflow-x-auto pb-2' : 'flex gap-2 overflow-x-auto pb-1'}>
        {(props.products || []).map((product, idx) => (
          <div key={idx} className={isPublic ? 'flex-shrink-0 w-36 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm' : 'flex-shrink-0 w-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-200'}>
            {product.image ? (
              <img src={product.image} alt={product.name} className={isPublic ? 'w-full h-28 object-cover' : 'w-full h-16 object-cover'} />
            ) : (
              <div className={isPublic ? 'w-full h-28 bg-gray-200 flex items-center justify-center' : 'w-full h-16 bg-gray-200 flex items-center justify-center'}>
                <span className={isPublic ? 'text-xs text-gray-400' : 'text-[9px] text-gray-400'}>No image</span>
              </div>
            )}
            <div className={isPublic ? 'p-3 text-left' : 'p-1'}>
              <p className={isPublic ? 'text-xs font-semibold text-black truncate' : 'text-[10px] font-semibold text-black truncate'}>{product.name}</p>
              <p className={isPublic ? 'text-xs text-green-700 font-semibold mt-1' : 'text-[10px] text-green-700 font-medium'}>{product.price}</p>
            </div>
          </div>
        ))}
      </div>
      {props.bundleCtaText && (
        <a
          href={props.bundleCtaLink || '#'}
          {...(isPublic ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={isPublic ? 'block w-full mt-4 py-3.5 bg-black text-white text-xs font-bold text-center rounded-2xl' : 'block w-full mt-2 py-2 bg-black text-white text-[10px] font-bold text-center rounded-lg'}
          onClick={(e) => {
            e.stopPropagation()
            if (!isPublic) {
              e.preventDefault()
            }
          }}
        >
          {props.bundleCtaText}
        </a>
      )}
    </div>
  )
}

export const ProductBundleEditor = ({ props = {}, onChange }) => {
  const products = props.products || []

  const updateProduct = (idx, field, value) => {
    onChange('products', products.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }

  const addProduct = () => {
    onChange('products', [...products, { shopifyId: '', image: '', name: 'New Product', price: '$0.00' }])
  }

  const removeProduct = (idx) => {
    onChange('products', products.filter((_, i) => i !== idx))
  }

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Title</label>
        <input type="text" value={props.title || ''} onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Subtitle</label>
        <input type="text" value={props.subtitle || ''} onChange={(e) => onChange('subtitle', e.target.value)}
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#CAC4CF]">Products</label>
          <button onClick={addProduct} className="text-xs text-[#3e6ff4] hover:text-[#60a5fa]">+ Add</button>
        </div>
        <div className="space-y-3">
          {products.map((p, idx) => (
            <div key={idx} className="bg-[#111827] border border-[#3e6ff4]/20 rounded p-2 space-y-1.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#CAC4CF] font-semibold">Product {idx + 1}</span>
                <button onClick={() => removeProduct(idx)} className="text-red-400 text-xs hover:text-red-300">✕</button>
              </div>
              {[
                { key: 'name', placeholder: 'Product name' },
                { key: 'price', placeholder: 'Price (e.g. $29.99)' },
                { key: 'image', placeholder: 'Image URL' },
                { key: 'shopifyId', placeholder: 'Shopify ID (optional)' },
              ].map(({ key, placeholder }) => (
                <input key={key} type="text" placeholder={placeholder} value={p[key] || ''}
                  onChange={(e) => updateProduct(idx, key, e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#1f2937] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">CTA Text</label>
        <input type="text" value={props.bundleCtaText || ''} onChange={(e) => onChange('bundleCtaText', e.target.value)}
          placeholder="Buy the Look"
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">CTA Link</label>
        <input type="text" value={props.bundleCtaLink || ''} onChange={(e) => onChange('bundleCtaLink', e.target.value)}
          placeholder="https://checkout.shopify.com/bundle"
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
    </>
  )
}
