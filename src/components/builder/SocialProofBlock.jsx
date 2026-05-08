// SocialProofBlock — Customer reviews with star ratings

export const SocialProofPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'

  return (
    <div className={isPublic ? 'w-full px-5 py-5 bg-white' : 'w-full px-3 py-3 bg-white'}>
      {props.title && <h3 className={isPublic ? 'text-lg font-bold text-black text-left mb-3' : 'text-xs font-bold text-black mb-2'}>{props.title}</h3>}
      <div className={isPublic ? 'space-y-3' : 'space-y-2'}>
        {(props.reviews || []).map((review, idx) => (
          <div key={idx} className={isPublic ? 'bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left shadow-sm' : 'bg-gray-50 rounded-lg p-2 border border-gray-100'}>
            <div className={isPublic ? 'flex items-center gap-1 mb-2' : 'flex items-center gap-0.5 mb-1'}>
              {Array.from({ length: review.rating || 0 }).map((_, i) => (
                <span key={i} className={isPublic ? 'text-yellow-400 text-base' : 'text-yellow-400 text-[11px]'}>★</span>
              ))}
              {Array.from({ length: 5 - (review.rating || 0) }).map((_, i) => (
                <span key={i} className={isPublic ? 'text-gray-300 text-base' : 'text-gray-300 text-[11px]'}>★</span>
              ))}
            </div>
            <p className={isPublic ? 'text-sm text-gray-700 leading-6' : 'text-[10px] text-gray-700 leading-relaxed'}>"{review.text}"</p>
            <p className={isPublic ? 'text-xs text-gray-500 mt-3 font-semibold' : 'text-[9px] text-gray-500 mt-1 font-semibold'}>— {review.author}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export const SocialProofEditor = ({ props = {}, onChange }) => {
  const reviews = props.reviews || []

  const updateReview = (idx, field, value) => {
    onChange('reviews', reviews.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  const addReview = () => {
    onChange('reviews', [...reviews, { text: '', author: '', rating: 5, image: '' }])
  }

  const removeReview = (idx) => {
    onChange('reviews', reviews.filter((_, i) => i !== idx))
  }

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Title</label>
        <input type="text" value={props.title || ''} onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#CAC4CF]">Reviews</label>
          <button onClick={addReview} className="text-xs text-[#3e6ff4] hover:text-[#60a5fa]">+ Add</button>
        </div>
        <div className="space-y-3">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-[#111827] border border-[#3e6ff4]/20 rounded p-2 space-y-1.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#CAC4CF] font-semibold">Review {idx + 1}</span>
                <button onClick={() => removeReview(idx)} className="text-red-400 text-xs hover:text-red-300">✕</button>
              </div>
              <input type="text" placeholder="Review text" value={review.text || ''}
                onChange={(e) => updateReview(idx, 'text', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#1f2937] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none" />
              <input type="text" placeholder="Author name" value={review.author || ''}
                onChange={(e) => updateReview(idx, 'author', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#1f2937] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none" />
              <div>
                <label className="text-[10px] text-[#CAC4CF] mb-1 block">Rating (1–5)</label>
                <input type="number" min="1" max="5" value={review.rating || 5}
                  onChange={(e) => updateReview(idx, 'rating', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-[#1f2937] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
