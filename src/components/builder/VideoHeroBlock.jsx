// VideoHeroBlock — Video hero with fallback image and play overlay

export const VideoHeroPreview = ({ props = {}, uploads = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const videoUrl = typeof props.videoUrl === 'string' ? props.videoUrl.trim() : ''
  const previewImage = uploads.heroVideoPosterPreviewUrl || uploads.heroImagePreviewUrl || props.posterImage || props.fallbackImage
  const shouldRenderVideo = Boolean(videoUrl)
  const emptyStateLabel = uploads.heroVideoFileName ? `Selected video: ${uploads.heroVideoFileName}` : 'No preview image set'

  return (
    <div className="w-full relative bg-white">
      {shouldRenderVideo ? (
        <video
          autoPlay={props.autoplay}
          muted={props.muted}
          loop={props.loop}
          playsInline
          controls={!props.autoplay}
          poster={previewImage || undefined}
          preload="metadata"
          className={isPublic ? 'w-full h-72 object-cover bg-black' : 'w-full h-40 object-cover bg-black'}
        >
          <source src={videoUrl} type={props.mimeType || undefined} />
        </video>
      ) : previewImage ? (
        <img
          src={previewImage}
          alt={props.title || 'Video'}
          className={isPublic ? 'w-full h-72 object-cover' : 'w-full h-40 object-cover'}
        />
      ) : (
        <div className={isPublic ? 'w-full h-72 bg-gray-900 flex items-center justify-center' : 'w-full h-40 bg-gray-900 flex items-center justify-center'}>
          <span className={isPublic ? 'text-sm text-gray-400 px-4 text-center' : 'text-[10px] text-gray-400 px-2 text-center'}>{emptyStateLabel}</span>
        </div>
      )}
      {!shouldRenderVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={isPublic ? 'w-14 h-14 bg-black/60 rounded-full flex items-center justify-center shadow-lg' : 'w-10 h-10 bg-black/60 rounded-full flex items-center justify-center'}>
            <div className={isPublic ? 'w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1.5' : 'w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1'} />
          </div>
        </div>
      )}
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

export const VideoHeroEditor = ({ props = {}, uploads = {}, onChange, onUploadChange }) => (
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
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Video File</label>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => onUploadChange('heroVideoFile', e.target.files?.[0] ?? null)}
        className="w-full text-sm text-[#CAC4CF] file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-[#111827] file:text-white"
      />
      {uploads.heroVideoFileName && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#CAC4CF]">
          <span className="truncate">{uploads.heroVideoFileName}</span>
          <button
            type="button"
            onClick={() => onUploadChange('heroVideoFile', null)}
            className="text-[#60a5fa] hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}
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
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Hero Image Upload</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUploadChange('heroImageFile', e.target.files?.[0] ?? null)}
        className="w-full text-sm text-[#CAC4CF] file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-[#111827] file:text-white"
      />
      {uploads.heroImagePreviewUrl && (
        <div className="mt-2 space-y-2">
          <img src={uploads.heroImagePreviewUrl} alt="Hero upload preview" className="w-full h-24 object-cover rounded border border-[#3e6ff4]/20" />
          <button
            type="button"
            onClick={() => onUploadChange('heroImageFile', null)}
            className="text-xs text-[#60a5fa] hover:text-white transition-colors"
          >
            Clear hero image
          </button>
        </div>
      )}
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
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Poster Image Upload</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUploadChange('heroVideoPosterFile', e.target.files?.[0] ?? null)}
        className="w-full text-sm text-[#CAC4CF] file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-[#111827] file:text-white"
      />
      {uploads.heroVideoPosterPreviewUrl && (
        <div className="mt-2 space-y-2">
          <img src={uploads.heroVideoPosterPreviewUrl} alt="Poster upload preview" className="w-full h-24 object-cover rounded border border-[#3e6ff4]/20" />
          <button
            type="button"
            onClick={() => onUploadChange('heroVideoPosterFile', null)}
            className="text-xs text-[#60a5fa] hover:text-white transition-colors"
          >
            Clear poster image
          </button>
        </div>
      )}
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
