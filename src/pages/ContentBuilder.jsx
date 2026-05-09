import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { saveDraft as saveDraftContent, publishContent } from '../service/api/content'
import PreviewComponent from '../components/builder/PreviewComponent'
import ComponentEditor from '../components/builder/ComponentEditor'
import Loader from '../components/Loader'

const revokePreviewUrl = (url) => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

const revokeUploadPreviewUrls = (uploads = {}) => {
  revokePreviewUrl(uploads.heroImagePreviewUrl)
  revokePreviewUrl(uploads.heroVideoPosterPreviewUrl)
}

const hasUploadData = (uploads = {}) => Boolean(
  uploads.heroImageFile
  || uploads.heroImagePreviewUrl
  || uploads.heroVideoFile
  || uploads.heroVideoFileName
  || uploads.heroVideoPosterFile
  || uploads.heroVideoPosterPreviewUrl
)

const BLOCK_UPLOAD_CONFIG = {
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

const ContentBuilder = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [templateId, setTemplateId] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [blockUploads, setBlockUploads] = useState({})
  const [metadata, setMetadata] = useState({
    name: 'My Landing Page',
    description: '',
    smsExclusiveOffer: { enabled: false, discountPercent: 0, barLabel: '' },
  })
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Processing...')
  const blockUploadsRef = useRef(blockUploads)

  // Initialize from template or blank
  useEffect(() => {
    const template = location.state?.template
    if (template?.id) setTemplateId(template.id)
    const blocks = template?.structure?.blocks
    if (blocks?.length) {
      setBlocks(blocks.map((block, idx) => ({ ...block, id: idx })))
      if (template.metadata) setMetadata(template.metadata)
    } else {
      setBlocks([])
    }
    setBlockUploads((currentUploads) => {
      Object.values(currentUploads).forEach(revokeUploadPreviewUrls)
      return {}
    })
  }, [location.state])

  useEffect(() => {
    blockUploadsRef.current = blockUploads
  }, [blockUploads])

  useEffect(() => () => {
    Object.values(blockUploadsRef.current).forEach(revokeUploadPreviewUrls)
  }, [])

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
      default:
        return {}
    }
  }



  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const MIN_LOADER_MS = 1500

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
    setLoading(true)
    const body = {
      template: templateId ?? 3,
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
      {loading && <Loader message={loadingMessage} />}
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
