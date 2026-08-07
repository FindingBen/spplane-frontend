// ProductImageBlock — Simple image block with preserved aspect ratio

export const ProductImagePreview = ({ props = {}, uploads = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const altText = typeof props.alt === 'string' && props.alt.trim() ? props.alt.trim() : 'Image'
  const previewImage = uploads.imagePreviewUrl || props.image

  return (
    <div className={isPublic ? 'w-full bg-white px-5 py-5' : 'w-full bg-white px-3 py-3'}>
      {previewImage ? (
        <img src={previewImage} alt={altText} className="w-full h-auto" />
      ) : (
        <div className={isPublic ? 'flex min-h-40 items-center justify-center bg-gray-100' : 'flex min-h-28 items-center justify-center bg-gray-100'}>
          <span className={isPublic ? 'text-xs text-gray-400' : 'text-xs text-gray-400'}>Image block</span>
        </div>
      )}
    </div>
  )
}

export const ProductImageEditor = ({ props = {}, uploads = {}, onChange, onUploadChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Image File</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUploadChange('imageFile', e.target.files?.[0] ?? null)}
        className="w-full text-xs text-[#CAC4CF] file:mr-3 file:rounded file:border-0 file:bg-[#111827] file:px-3 file:py-2 file:text-white"
      />
      {uploads.imagePreviewUrl && (
        <div className="mt-2 space-y-2">
          <img src={uploads.imagePreviewUrl} alt="Image upload preview" className="w-full h-auto rounded border border-[#3e6ff4]/20" />
          <button
            type="button"
            onClick={() => onUploadChange('imageFile', null)}
            className="text-xs text-[#60a5fa] hover:text-white transition-colors"
          >
            Clear image file
          </button>
        </div>
      )}
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Image URL (optional)</label>
      <input
        type="text"
        value={props.image || ''}
        onChange={(e) => onChange('image', e.target.value)}
        placeholder="https://..."
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Alt Text</label>
      <input
        type="text"
        value={props.alt || ''}
        onChange={(e) => onChange('alt', e.target.value)}
        placeholder="Describe the image"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
  </div>
)
