import { useEffect, useState } from 'react'

const MAX_CAROUSEL_IMAGES = 5

const normalizeCarouselImage = (item = {}, index = 0) => {
  if (typeof item === 'string') {
    return {
      url: item,
      alt: `Carousel image ${index + 1}`,
    }
  }

  return {
    url: typeof item?.url === 'string' ? item.url : typeof item?.image === 'string' ? item.image : '',
    alt: typeof item?.alt === 'string' ? item.alt : typeof item?.title === 'string' ? item.title : `Carousel image ${index + 1}`,
  }
}

const getEditorImages = (props = {}) => {
  const sourceItems = Array.isArray(props.images) && props.images.length > 0
    ? props.images
    : Array.isArray(props.items)
      ? props.items
      : []

  return sourceItems.slice(0, MAX_CAROUSEL_IMAGES).map(normalizeCarouselImage)
}

const getPreviewImages = (props = {}, uploads = {}) => {
  const previewUrls = Array.isArray(uploads.carouselImagePreviewUrls)
    ? uploads.carouselImagePreviewUrls
    : []

  return getEditorImages(props).map((item, index) => ({
    ...item,
    url: previewUrls[index] || item.url,
  }))
}

const syncImages = (onChange, images) => {
  onChange('images', images)
  onChange('items', images)
}

export const CarouselPreview = ({ props = {}, uploads = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const images = getPreviewImages(props, uploads)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex((currentIndex) => Math.min(currentIndex, Math.max(images.length - 1, 0)))
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className={isPublic ? 'w-full bg-white px-5 py-5' : 'w-full bg-white px-3 py-3'}>
        <div className={isPublic ? 'flex min-h-48 items-center justify-center rounded-3xl bg-gray-100' : 'flex min-h-28 items-center justify-center rounded-xl bg-gray-100'}>
          <span className={isPublic ? 'text-xs text-gray-400' : 'text-xs text-gray-400'}>Carousel block</span>
        </div>
      </div>
    )
  }

  const activeImage = images[activeIndex] ?? images[0]

  const moveSlide = (event, direction) => {
    event.stopPropagation()
    setActiveIndex((currentIndex) => (currentIndex + direction + images.length) % images.length)
  }

  return (
    <div className={isPublic ? 'w-full bg-white px-5 py-5' : 'w-full bg-white px-3 py-3'}>
      <div className={isPublic ? 'relative overflow-hidden rounded-[28px] bg-gray-100' : 'relative overflow-hidden rounded-xl bg-gray-100'}>
        {activeImage.url ? (
          <img
            src={activeImage.url}
            alt={activeImage.alt || 'Carousel image'}
            className={isPublic ? 'h-[280px] w-full object-cover' : 'h-40 w-full object-cover'}
          />
        ) : (
          <div className={isPublic ? 'flex h-[280px] items-center justify-center text-xs text-gray-400' : 'flex h-40 items-center justify-center text-xs text-gray-400'}>
            Add an image to this slide.
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => moveSlide(event, -1)}
              className={isPublic ? 'absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-base font-semibold text-white' : 'absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-xs font-semibold text-white'}
            >
              {'<'}
            </button>
            <button
              type="button"
              onClick={(event) => moveSlide(event, 1)}
              className={isPublic ? 'absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-base font-semibold text-white' : 'absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-xs font-semibold text-white'}
            >
              {'>'}
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={isPublic ? 'mt-3 flex gap-2 overflow-x-auto pb-1' : 'mt-2 flex gap-1.5 overflow-x-auto pb-1'}>
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setActiveIndex(index)
              }}
              className={`${isPublic ? 'h-16 w-16 rounded-2xl' : 'h-11 w-11 rounded-lg'} shrink-0 overflow-hidden border ${index === activeIndex ? 'border-black shadow-[0_0_0_1px_rgba(17,24,39,0.12)]' : 'border-gray-200'}`}
            >
              {image.url ? (
                <img src={image.url} alt={image.alt || `Slide ${index + 1}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-400">
                  Empty
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const CarouselEditor = ({ props = {}, uploads = {}, onChange, onUploadChange }) => {
  const images = getEditorImages(props)
  const previewUrls = Array.isArray(uploads.carouselImagePreviewUrls)
    ? uploads.carouselImagePreviewUrls
    : []

  const updateImage = (index, field, value) => {
    const nextImages = images.map((image, imageIndex) => (
      imageIndex === index ? { ...image, [field]: value } : image
    ))

    syncImages(onChange, nextImages)
  }

  const addImage = () => {
    if (images.length >= MAX_CAROUSEL_IMAGES) {
      return
    }

    syncImages(onChange, [...images, { url: '', alt: '' }])
  }

  const removeImage = (index) => {
    const nextImages = images.filter((_, imageIndex) => imageIndex !== index)
    syncImages(onChange, nextImages)
    onUploadChange('carouselImageRemove', null, { index })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-[#CAC4CF]">Images</label>
          <p className="mt-1 text-[10px] text-[#CAC4CF]/60">Upload or paste up to {MAX_CAROUSEL_IMAGES} slides.</p>
        </div>
        <button
          type="button"
          onClick={addImage}
          disabled={images.length >= MAX_CAROUSEL_IMAGES}
          className="text-xs text-[#60a5fa] transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-[#CAC4CF]/40"
        >
          + Add image
        </button>
      </div>

      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={`carousel-image-${index}`} className="space-y-2 rounded border border-[#3e6ff4]/20 bg-[#111827] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#CAC4CF]">Slide {index + 1}</span>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-xs text-red-400 transition-colors hover:text-red-300"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#CAC4CF]">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => onUploadChange('carouselImageFile', event.target.files?.[0] ?? null, { index })}
                className="w-full text-xs text-[#CAC4CF] file:mr-3 file:rounded file:border-0 file:bg-[#1f2937] file:px-3 file:py-2 file:text-white"
              />
              {previewUrls[index] && (
                <div className="mt-2 space-y-2">
                  <img src={previewUrls[index]} alt={`Carousel upload ${index + 1}`} className="h-24 w-full rounded border border-[#3e6ff4]/20 object-cover" />
                  <button
                    type="button"
                    onClick={() => onUploadChange('carouselImageFile', null, { index })}
                    className="text-xs text-[#60a5fa] transition-colors hover:text-white"
                  >
                    Clear uploaded image
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#CAC4CF]">Image URL</label>
              <input
                type="text"
                value={image.url || ''}
                onChange={(event) => updateImage(index, 'url', event.target.value)}
                placeholder="https://..."
                className="w-full rounded border border-[#3e6ff4]/20 bg-[#1f2937] px-3 py-2 text-xs text-white focus:border-[#3e6ff4]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#CAC4CF]">Alt Text</label>
              <input
                type="text"
                value={image.alt || ''}
                onChange={(event) => updateImage(index, 'alt', event.target.value)}
                placeholder="Describe this slide"
                className="w-full rounded border border-[#3e6ff4]/20 bg-[#1f2937] px-3 py-2 text-xs text-white focus:border-[#3e6ff4]/60 focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}