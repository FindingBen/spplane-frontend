import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { generateContentProduct, saveDraft as saveDraftContent, publishContent } from '../service/api/content'
import PreviewComponent from '../components/builder/PreviewComponent'
import ComponentEditor from '../components/builder/ComponentEditor'
import Loader from '../components/Loader'

const revokePreviewUrl = (url) => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

const revokeUploadPreviewUrls = (uploads = {}) => {
  revokePreviewUrl(uploads.imagePreviewUrl)
  revokePreviewUrl(uploads.heroImagePreviewUrl)
  revokePreviewUrl(uploads.heroVideoPosterPreviewUrl)
}

const hasUploadData = (uploads = {}) => Boolean(
  uploads.imageFile
  || uploads.imagePreviewUrl
  || uploads.heroImageFile
  || uploads.heroImagePreviewUrl
  || uploads.heroVideoFile
  || uploads.heroVideoFileName
  || uploads.heroVideoPosterFile
  || uploads.heroVideoPosterPreviewUrl
)

const BLOCK_UPLOAD_CONFIG = {
  image: [
    { uploadKey: 'imageFile', propKey: 'image', fieldPrefix: 'image-file' },
  ],
  'video-hero': [
    { uploadKey: 'heroVideoFile', propKey: 'videoUrl', fieldPrefix: 'video-file' },
    { uploadKey: 'heroImageFile', propKey: 'fallbackImage', fieldPrefix: 'image-file' },
    { uploadKey: 'heroVideoPosterFile', propKey: 'posterImage', fieldPrefix: 'poster-image-file' },
  ],
}

const getUploadFieldName = (blockId, fieldPrefix) => `${fieldPrefix}-${blockId}`

const serializeBlockForSubmission = (block, uploads = {}) => {
  const uploadConfig = BLOCK_UPLOAD_CONFIG[block.type]

  if (!uploadConfig) {
    return block
  }

  const { uploadFields: _ignoredUploadFields, ...nextProps } = block.props ?? {}
  const nextUploadFields = {}

  uploadConfig.forEach(({ uploadKey, propKey, fieldPrefix }) => {
    if (!uploads[uploadKey]) {
      return
    }

    nextProps[propKey] = ''
    nextUploadFields[propKey] = {
      uploadField: getUploadFieldName(block.id, fieldPrefix),
    }
  })

  if (Object.keys(nextUploadFields).length > 0) {
    nextProps.uploadFields = nextUploadFields
  }

  return {
    ...block,
    props: nextProps,
  }
}

const collectUploadsForSubmission = (blocks, blockUploads) => blocks.reduce((uploads, block) => {
  const blockUploadConfig = BLOCK_UPLOAD_CONFIG[block.type]
  const currentBlockUploads = blockUploads[block.id]

  if (!blockUploadConfig || !currentBlockUploads) {
    return uploads
  }

  blockUploadConfig.forEach(({ uploadKey, fieldPrefix }) => {
    const file = currentBlockUploads[uploadKey]

    if (file) {
      uploads[getUploadFieldName(block.id, fieldPrefix)] = file
    }
  })

  return uploads
}, {})

const DEFAULT_TEMPLATE_ID = 3
const MIN_LOADER_MS = 1500

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const createDefaultMetadata = () => ({
  name: 'My Landing Page',
  description: '',
  smsExclusiveOffer: { enabled: false, discountPercent: 0, barLabel: '' },
})

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const pickFirstArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value
    }
  }

  return []
}

const formatPriceLabel = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `$${value.toFixed(2)}`
  }

  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  return /^[\d.]+$/.test(trimmedValue) ? `$${trimmedValue}` : trimmedValue
}

const createBuilderBlocks = (blocks = []) => {
  if (!Array.isArray(blocks)) {
    return []
  }

  return blocks.map((block, index) => ({
    ...block,
    id: index,
    props: block?.props ?? {},
  }))
}

const extractGeneratedComponents = (payload) => pickFirstArray(
  payload?.structure?.components,
  payload?.content?.structure?.components,
)

const createHeroBlock = (component = {}, payload = {}) => ({
  type: 'video-hero',
  props: {
    videoUrl: pickFirstString(component?.props?.videoUrl, component?.props?.video_url),
    title: pickFirstString(
      payload?.copy?.hero_title,
      component?.props?.title,
      component?.props?.headline,
      payload?.product?.title,
    ),
    fallbackImage: pickFirstString(
      payload?.product?.featured_image_url,
      payload?.product?.primary_variant?.image_url,
      component?.props?.image,
      payload?.rules?.gallery_items?.[0]?.url,
      payload?.product?.images?.[0],
    ),
    posterImage: pickFirstString(
      payload?.product?.featured_image_url,
      payload?.rules?.gallery_items?.[0]?.url,
      payload?.product?.images?.[0],
    ),
    autoplay: false,
    muted: true,
    loop: false,
  },
})

const createCtaBlock = (component = {}, payload = {}) => ({
  type: 'cta',
  props: {
    text: pickFirstString(
      payload?.copy?.cta_label,
      component?.props?.text,
      'Shop now',
    ),
    link: pickFirstString(
      component?.props?.url,
      component?.props?.link,
      payload?.product?.product_url,
    ),
    sticky: true,
    style: 'primary',
    size: 'large',
  },
})

const createBundleBlock = (payload = {}) => {
  const variantItems = pickFirstArray(payload?.rules?.variant_items, payload?.product?.variants)

  if (variantItems.length === 0) {
    return null
  }

  return {
    type: 'product-bundle',
    props: {
      title: pickFirstString(payload?.copy?.bundle_headline, 'Choose your preferred option'),
      subtitle: pickFirstString(
        payload?.copy?.hero_subtitle,
        payload?.product?.seo_description,
        payload?.product?.description_text,
      ),
      products: variantItems.map((item, index) => ({
        shopifyId: pickFirstString(item?.id, item?.shopify_variant_id),
        image: pickFirstString(
          item?.image_url,
          payload?.rules?.gallery_items?.[index]?.url,
          payload?.product?.featured_image_url,
        ),
        name: pickFirstString(item?.title, payload?.copy?.bundle_items?.[index], `Option ${index + 1}`),
        price: formatPriceLabel(item?.price || item?.price_amount || payload?.rules?.price_label),
      })),
      bundleCtaText: pickFirstString(payload?.copy?.cta_label, 'Shop now'),
      bundleCtaLink: pickFirstString(payload?.product?.product_url),
    },
  }
}

const mapGeneratedComponentToBlock = (component = {}, payload = {}) => {
  switch (component?.type) {
    case 'hero':
      return createHeroBlock(component, payload)
    case 'cta':
      return createCtaBlock(component, payload)
    case 'product-bundle':
      return {
        type: 'product-bundle',
        props: component?.props ?? {},
      }
    case 'video-hero':
    case 'comparison-table':
    case 'inventory-tracker':
    case 'social-proof':
    case 'countdown-timer':
    case 'text':
    case 'image':
      return {
        type: component.type,
        props: component?.props ?? {},
      }
    case 'product-image':
      return {
        type: 'image',
        props: component?.props ?? {},
      }
    default:
      return null
  }
}

const normalizeMetadata = (metadata = {}, fallback = {}) => {
  const defaults = createDefaultMetadata()

  return {
    name: pickFirstString(metadata?.name, fallback?.name, defaults.name),
    description: pickFirstString(metadata?.description, fallback?.description, defaults.description),
    smsExclusiveOffer: {
      ...defaults.smsExclusiveOffer,
      ...(fallback?.smsExclusiveOffer && typeof fallback.smsExclusiveOffer === 'object' ? fallback.smsExclusiveOffer : {}),
      ...(metadata?.smsExclusiveOffer && typeof metadata.smsExclusiveOffer === 'object' ? metadata.smsExclusiveOffer : {}),
    },
  }
}

const resolveGeneratedBlocks = (payload) => {
  const directBlocks = pickFirstArray(
    payload?.structure?.blocks,
    payload?.content?.structure?.blocks,
  )

  if (directBlocks.length > 0) {
    return createBuilderBlocks(directBlocks)
  }

  const components = extractGeneratedComponents(payload)
  const mappedBlocks = components
    .map((component) => mapGeneratedComponentToBlock(component, payload))
    .filter(Boolean)

  const hasCtaBlock = mappedBlocks.some((block) => block.type === 'cta')
  const shouldShowBundle = payload?.rules?.blocks?.show_bundle !== false
  const bundleBlock = shouldShowBundle ? createBundleBlock(payload) : null

  if (bundleBlock && !mappedBlocks.some((block) => block.type === 'product-bundle')) {
    const insertionIndex = hasCtaBlock
      ? mappedBlocks.findIndex((block) => block.type === 'cta')
      : mappedBlocks.length

    mappedBlocks.splice(insertionIndex, 0, bundleBlock)
  }

  return createBuilderBlocks(mappedBlocks)
}

const resolveGeneratedMetadata = (payload, generationRequest) => normalizeMetadata(
  payload?.structure?.metadata ?? payload?.content?.structure?.metadata ?? payload?.content?.metadata ?? {},
  {
    name: pickFirstString(
      payload?.content?.name,
      payload?.product?.title ? `${payload.product.title} Landing Page` : '',
      generationRequest?.productTitle ? `${generationRequest.productTitle} Landing Page` : '',
    ),
    description: pickFirstString(
      payload?.copy?.hero_subtitle,
      payload?.copy?.description,
      payload?.product?.seo_description,
      payload?.product?.description_text,
      payload?.product?.handle ? `Generated from ${payload.product.handle}` : '',
      generationRequest?.productHandle ? `Generated from ${generationRequest.productHandle}` : '',
    ),
  },
)

const buildGenerationNotice = ({ payload, tone = 'success', productTitle = '' }) => {
  if (tone === 'error') {
    return {
      tone,
      title: 'Content generation failed',
      description: payload?.error || payload?.detail || payload?.message || 'We could not generate blocks for this product.',
    }
  }

  return {
    tone,
    title: 'Content ready',
    description: productTitle
      ? `${productTitle} has been turned into editable blocks. Review and refine anything you want.`
      : 'Your generated content is ready to review and refine.',
  }
}

function BuilderNotice({ notice, onDismiss }) {
  if (!notice) {
    return null
  }

  const toneStyles = notice.tone === 'error'
    ? 'border-red-500/35 bg-red-500/10 text-red-100'
    : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-50'

  return (
    <div className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 ${toneStyles}`}>
      <div>
        <p className="text-sm font-semibold">{notice.title}</p>
        <p className="mt-1 text-sm opacity-85">{notice.description}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg border border-white/10 bg-black/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-black/20 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  )
}

const ContentBuilder = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const generationRequest = location.state?.productGeneration
  const [templateId, setTemplateId] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [blockUploads, setBlockUploads] = useState({})
  const [metadata, setMetadata] = useState(createDefaultMetadata)
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [loading, setLoading] = useState(Boolean(generationRequest))
  const [loadingMessage, setLoadingMessage] = useState(
    generationRequest ? 'Generating your landing page...' : 'Processing...'
  )
  const [loadingDetail, setLoadingDetail] = useState(
    generationRequest?.productTitle
      ? `We are building editable blocks for ${generationRequest.productTitle}.`
      : ''
  )
  const [builderNotice, setBuilderNotice] = useState(null)
  const blockUploadsRef = useRef(blockUploads)

  const clearBlockUploads = () => {
    setBlockUploads((currentUploads) => {
      Object.values(currentUploads).forEach(revokeUploadPreviewUrls)
      return {}
    })
  }

  // Initialize from template or blank
  useEffect(() => {
    const template = location.state?.template
    const nextBlocks = createBuilderBlocks(template?.structure?.blocks)

    setBuilderNotice(null)
    clearBlockUploads()

    if (template?.id) {
      setTemplateId(template.id)
      setBlocks(nextBlocks)
      setSelectedBlockId(nextBlocks[0]?.id ?? null)
      setMetadata(normalizeMetadata(template?.metadata ?? template?.structure?.metadata))
    } else {
      setTemplateId(null)
      setBlocks([])
      setSelectedBlockId(null)
      setMetadata(createDefaultMetadata())
    }
  }, [location.state])

  useEffect(() => {
    blockUploadsRef.current = blockUploads
  }, [blockUploads])

  useEffect(() => () => {
    Object.values(blockUploadsRef.current).forEach(revokeUploadPreviewUrls)
  }, [])

  useEffect(() => {
    if (!generationRequest?.productId) {
      return undefined
    }

    let isDisposed = false

    const runGeneration = async () => {
      setBuilderNotice(null)
      setLoadingMessage('Generating your landing page...')
      setLoadingDetail(
        generationRequest?.productTitle
          ? `We are building editable blocks for ${generationRequest.productTitle}. This can take a moment.`
          : 'We are building editable blocks for your selected product. This can take a moment.'
      )
      setLoading(true)

      try {
        const [payload] = await Promise.all([
          generateContentProduct({ product_id: generationRequest.productId, persist: true }),
          sleep(MIN_LOADER_MS),
        ])

        if (isDisposed) {
          return
        }

        const generatedBlocks = resolveGeneratedBlocks(payload)

        setTemplateId(payload?.template_id ?? DEFAULT_TEMPLATE_ID)
        setBlocks(generatedBlocks)
        setSelectedBlockId(generatedBlocks[0]?.id ?? null)
        setMetadata(resolveGeneratedMetadata(payload, generationRequest))
        setBuilderNotice(buildGenerationNotice({
          payload,
          productTitle: generationRequest?.productTitle,
        }))
      } catch (error) {
        if (isDisposed) {
          return
        }

        setTemplateId(DEFAULT_TEMPLATE_ID)
        setBlocks([])
        setSelectedBlockId(null)
        setMetadata(resolveGeneratedMetadata({}, generationRequest))
        setBuilderNotice(buildGenerationNotice({
          payload: error?.response?.data,
          tone: 'error',
        }))
      } finally {
        if (!isDisposed) {
          setLoading(false)
          setLoadingDetail('')
        }
      }
    }

    runGeneration()

    return () => {
      isDisposed = true
    }
  }, [generationRequest?.productId])

  const addBlock = (type) => {
    const newBlock = {
      id: Math.max(...blocks.map((b) => b.id), -1) + 1,
      type,
      props: getDefaultProps(type),
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const removeBlock = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id))
    setBlockUploads((currentUploads) => {
      const nextUploads = { ...currentUploads }
      revokeUploadPreviewUrls(nextUploads[id])
      delete nextUploads[id]
      return nextUploads
    })
    setSelectedBlockId(null)
  }

  const updateBlock = (id, updates) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...updates } } : b))
    )
  }

  const updateBlockUploads = (id, key, file) => {
    setBlockUploads((currentUploads) => {
      const currentBlockUploads = currentUploads[id] ?? {}
      const nextBlockUploads = { ...currentBlockUploads }

      if (key === 'imageFile') {
        revokePreviewUrl(currentBlockUploads.imagePreviewUrl)
        nextBlockUploads.imageFile = file
        nextBlockUploads.imagePreviewUrl = file ? URL.createObjectURL(file) : ''
      }

      if (key === 'heroImageFile') {
        revokePreviewUrl(currentBlockUploads.heroImagePreviewUrl)
        nextBlockUploads.heroImageFile = file
        nextBlockUploads.heroImagePreviewUrl = file ? URL.createObjectURL(file) : ''
      }

      if (key === 'heroVideoFile') {
        nextBlockUploads.heroVideoFile = file
        nextBlockUploads.heroVideoFileName = file?.name ?? ''
      }

      if (key === 'heroVideoPosterFile') {
        revokePreviewUrl(currentBlockUploads.heroVideoPosterPreviewUrl)
        nextBlockUploads.heroVideoPosterFile = file
        nextBlockUploads.heroVideoPosterPreviewUrl = file ? URL.createObjectURL(file) : ''
      }

      if (!hasUploadData(nextBlockUploads)) {
        const remainingUploads = { ...currentUploads }
        delete remainingUploads[id]
        return remainingUploads
      }

      return {
        ...currentUploads,
        [id]: nextBlockUploads,
      }
    })
  }

  const reorderBlocks = (fromIndex, toIndex) => {
    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, removed)
    setBlocks(newBlocks)
  }

  const getDefaultProps = (type) => {
    switch (type) {
      case 'video-hero':
        return {
          videoUrl: '',
          title: 'See It in Action',
          fallbackImage: 'https://via.placeholder.com/400x300',
          autoplay: true,
          muted: true,
          loop: true,
        }
      case 'product-bundle':
        return {
          title: 'Complete the Look',
          subtitle: 'Curated for you',
          products: [
            { shopifyId: '', image: 'https://via.placeholder.com/300x200', name: 'Product 1', price: '$29.99' },
            { shopifyId: '', image: 'https://via.placeholder.com/300x200', name: 'Product 2', price: '$49.99' },
          ],
          bundleCtaText: 'Buy the Look',
          bundleCtaLink: 'https://checkout.shopify.com/bundle',
        }
      case 'comparison-table':
        return {
          title: "Why We're Different",
          comparisons: [
            { feature: 'Material Quality', us: '100% Organic Cotton', competitor: '80% Polyester' },
            { feature: 'Durability', us: '5-year guarantee', competitor: '1-year warranty' },
          ],
        }
      case 'inventory-tracker':
        return {
          shopifyProductId: '',
          refreshIntervalMs: 30000,
          messageTemplate: 'Only {remaining} left in stock!',
          urgencyThreshold: 5,
          urgencyMessage: 'Last {remaining} available - order now!',
        }
      case 'social-proof':
        return {
          title: 'Loved by Our Customers',
          reviews: [
            { text: "Best quality I've ever bought!", author: 'Sarah M.', rating: 5, image: '' },
          ],
        }
      case 'countdown-timer':
        return {
          title: 'Flash Sale Ends In:',
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Sale ends soon - grab yours now!',
        }
      case 'cta':
        return {
          text: 'Buy Now',
          link: 'https://checkout.shopify.com/',
          sticky: true,
          style: 'primary',
          size: 'large',
        }
      case 'text':
        return {
          text: 'Add supporting details, delivery information, or extra context for your offer here.',
        }
      case 'image':
        return {
          image: 'https://via.placeholder.com/800x1000',
          alt: 'Product image',
        }
      default:
        return {}
    }
  }
  const buildStructure = () => ({
    version: '1',
    type: 'sms-landing-page',
    metadata: {
      name: metadata.name,
      description: metadata.description,
      smsExclusiveOffer: metadata.smsExclusiveOffer,
    },
    blocks: blocks.map((block) => {
      const { id: _ID, ...serializedBlock } = serializeBlockForSubmission(
        block,
        blockUploads[block.id],
      )

      return serializedBlock
    }),
  })

  const buildUploads = () => collectUploadsForSubmission(blocks, blockUploads)

  const submitContent = async (submitRequest, message) => {
    setLoadingMessage(message)
    setLoadingDetail('')
    setLoading(true)
    const body = {
      template: templateId ?? DEFAULT_TEMPLATE_ID,
      structure: buildStructure(),
      uploads: buildUploads(),
    }

    try {
      const [request] = await Promise.all([
        submitRequest(body),
        sleep(MIN_LOADER_MS),
      ])
      if (request.status === 201) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = () => submitContent(saveDraftContent, 'Saving draft...')

  const handlePublish = () => submitContent(publishContent, 'Publishing...')

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      {loading && <Loader message={loadingMessage} detail={loadingDetail} />}
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Header />

        {/* Main Content */}
        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="p-3 md:p-6 border-b border-[#3e6ff4]/20 flex items-center justify-between">
            <div>
              <p className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{metadata.name}</p>
              <p className="text-xs md:text-sm text-start text-[#CAC4CF]">Build your SMS landing page</p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={loading || blocks.length === 0}
                title={blocks.length === 0 ? 'Add at least one block before saving' : undefined}
                className="px-3 md:px-4 py-1.5 md:py-2 text-sm bg-[#1f2937] border border-[#3e6ff4]/30 text-white rounded-lg hover:bg-[#111827] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={loading || blocks.length === 0}
                title={blocks.length === 0 ? 'Add at least one block before publishing' : undefined}
                className="px-3 md:px-4 py-1.5 md:py-2 text-sm bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Publish
              </button>
            </div>
          </div>

          {builderNotice && (
            <div className="px-3 pt-3 md:px-6 md:pt-6">
              <BuilderNotice notice={builderNotice} onDismiss={() => setBuilderNotice(null)} />
            </div>
          )}

          {/* Builder Area */}
          <div className="flex-1 flex gap-2 md:gap-4 p-3 md:p-6 overflow-hidden">
            {/* Left Sidebar - Component Library */}
            <div className="w-48 md:w-64 bg-[#1f2937] rounded-xl border border-[#3e6ff4]/20 flex flex-col overflow-hidden">
              <div className="p-2 md:p-4 border-b border-[#3e6ff4]/20">
                <h2 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Blocks</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3">
                {[
                  { type: 'video-hero', label: 'Video Hero', icon: '🎬' },
                  { type: 'product-bundle', label: 'Product Bundle', icon: '📦' },
                  { type: 'comparison-table', label: 'Comparison Table', icon: '📊' },
                  { type: 'inventory-tracker', label: 'Inventory Tracker', icon: '📉' },
                  { type: 'social-proof', label: 'Social Proof', icon: '⭐' },
                  { type: 'countdown-timer', label: 'Countdown Timer', icon: '⏱️' },
                  { type: 'text', label: 'Text Block', icon: '📝' },
                  { type: 'image', label: 'Image Block', icon: '🖼️' },
                  { type: 'cta', label: 'CTA Button', icon: '🛒' },
                ].map((block) => (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    className="w-full p-2 md:p-3 bg-[#111827] hover:bg-[#1f2937] border border-[#3e6ff4]/20 hover:border-[#3e6ff4]/60 rounded-lg transition-all text-left"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-base md:text-lg">{block.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-white">{block.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Center - Mobile Preview */}
            <div className="flex-1 flex items-center justify-center">
              {/* iPhone 12 Mockup */}
              <div className="relative mx-auto border-[14px] bg-gray-900 border-gray-900 rounded-[2.5rem] h-[500px] w-[260px] shadow-2xl flex-shrink-0">
                
                {/* Notch */}
                
                {/* Screen content */}
                <div className="rounded-[2rem] overflow-hidden w-[232px] h-[472px] bg-white overflow-y-auto flex flex-col pt-2">
                  {/* SMS Exclusive Offer Bar */}
                  {metadata.smsExclusiveOffer?.enabled && (
                    <div className="w-full bg-green-700 text-white text-center py-1 px-2 text-[9px] font-semibold flex-shrink-0">
                      {metadata.smsExclusiveOffer.barLabel || `Exclusive ${metadata.smsExclusiveOffer.discountPercent}% Discount Applied`}
                    </div>
                  )}
                  {blocks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <div>
                        <p className="text-gray-400 text-sm">Add blocks to get started</p>
                      </div>
                    </div>
                  ) : (
                    blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`relative cursor-pointer transition-all ${
                          selectedBlockId === block.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <PreviewComponent component={block} uploads={blockUploads[block.id]} />
                        {selectedBlockId === block.id && (
                          <div className="absolute top-1 right-1 flex gap-1">
                            {idx > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); reorderBlocks(idx, idx - 1) }}
                                className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                              >↑</button>
                            )}
                            {idx < blocks.length - 1 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); reorderBlocks(idx, idx + 1) }}
                                className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                              >↓</button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }}
                              className="p-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                            >✕</button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Component Editor */}
            <div className="w-56 md:w-72 bg-[#1f2937] rounded-xl border border-[#3e6ff4]/20 flex flex-col overflow-hidden">
              <div className="p-2 md:p-4 border-b border-[#3e6ff4]/20">
                <h2 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                  {selectedBlockId !== null ? 'Edit Block' : 'Select Block'}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-2 md:p-4">
                {selectedBlockId !== null ? (
                  <ComponentEditor
                    component={blocks.find((b) => b.id === selectedBlockId)}
                    uploads={blockUploads[selectedBlockId]}
                    onUpdate={(updates) => updateBlock(selectedBlockId, updates)}
                    onUploadChange={(key, file) => updateBlockUploads(selectedBlockId, key, file)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#CAC4CF] text-sm">Click a block to edit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentBuilder
