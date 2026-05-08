// VideoHeroBlock — Video hero with fallback image and play overlay

export const VideoHeroPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'

  return (
    <div className="w-full relative bg-white">
      {props.fallbackImage ? (
        <img
          src={props.fallbackImage}
          alt={props.title || 'Video'}
          className={isPublic ? 'w-full h-72 object-cover' : 'w-full h-40 object-cover'}
        />
      ) : (
        <div className={isPublic ? 'w-full h-72 bg-gray-900 flex items-center justify-center' : 'w-full h-40 bg-gray-900 flex items-center justify-center'}>
          <span className={isPublic ? 'text-sm text-gray-400' : 'text-xs text-gray-400'}>No preview image set</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={isPublic ? 'w-14 h-14 bg-black/60 rounded-full flex items-center justify-center shadow-lg' : 'w-10 h-10 bg-black/60 rounded-full flex items-center justify-center'}>
          <div className={isPublic ? 'w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1.5' : 'w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1'} />
        </div>
      </div>
      {props.title && (
        <div className={isPublic ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-5 py-4' : 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2'}>
          <p className={isPublic ? 'text-white text-lg font-semibold leading-tight text-left' : 'text-white text-xs font-semibold'}>{props.title}</p>
        </div>
      )}
      <div className={isPublic ? 'absolute top-3 right-3 flex gap-2' : 'absolute top-2 right-2 flex gap-1'}>
        {props.autoplay && <span className={isPublic ? 'bg-black/65 text-white text-[10px] px-2 py-1 rounded-full tracking-wide' : 'bg-black/60 text-white text-[8px] px-1 py-0.5 rounded'}>AUTO</span>}
        {props.loop && <span className={isPublic ? 'bg-black/65 text-white text-[10px] px-2 py-1 rounded-full tracking-wide' : 'bg-black/60 text-white text-[8px] px-1 py-0.5 rounded'}>LOOP</span>}
      </div>
    </div>
  )
}

export const VideoHeroEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Video URL</label>
      <input
        type="text"
        value={props.videoUrl || ''}
        onChange={(e) => onChange('videoUrl', e.target.value)}
        placeholder="https://example.com/video.mp4"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Title</label>
      <input
        type="text"
        value={props.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Fallback Image URL</label>
      <input
        type="text"
        value={props.fallbackImage || ''}
        onChange={(e) => onChange('fallbackImage', e.target.value)}
        placeholder="https://..."
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div className="flex flex-col gap-2">
      {['autoplay', 'muted', 'loop'].map((flag) => (
        <label key={flag} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props[flag] ?? false}
            onChange={(e) => onChange(flag, e.target.checked)}
            className="w-4 h-4 accent-[#3e6ff4]"
          />
          <span className="text-xs text-[#CAC4CF] capitalize">{flag}</span>
        </label>
      ))}
    </div>
  </>
)
