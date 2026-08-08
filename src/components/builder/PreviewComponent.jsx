import { VideoHeroPreview } from './VideoHeroBlock'
import { ProductBundlePreview } from './ProductBundleBlock'
import { ComparisonTablePreview } from './ComparisonTableBlock'
import { InventoryTrackerPreview } from './InventoryTrackerBlock'
import { SocialProofPreview } from './SocialProofBlock'
import { CountdownTimerPreview } from './CountdownTimerBlock'
import { CtaPreview } from './CtaBlock'
import { TextBlockPreview } from './TextBlock'
import { ProductImagePreview } from './ProductImageBlock'
import { CarouselPreview } from './CarouselBlock'
import { ListBlockPreview } from './ListBlock'
import { DescriptionPreview } from './DescriptionBlock'
import { PricePreview } from './PriceBlock'
import { TaglinePreview } from './TaglineBlock'

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
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

  return trimmedValue.startsWith('$') ? trimmedValue : `$${trimmedValue}`
}

const normalizeHeroProps = (props = {}) => ({
  ...props,
  videoUrl: pickFirstString(props.videoUrl, props.video_url),
  title: pickFirstString(props.title, props.headline),
  subtitle: pickFirstString(props.subtitle),
  fallbackImage: pickFirstString(props.fallbackImage, props.posterImage, props.image),
  posterImage: pickFirstString(props.posterImage, props.fallbackImage, props.image),
  autoplay: props.autoplay ?? false,
  muted: props.muted ?? true,
  loop: props.loop ?? false,
})

const normalizeBundleProps = (props = {}) => ({
  ...props,
  title: pickFirstString(props.title, props.heading),
  subtitle: pickFirstString(props.subtitle, props.description),
  products: (Array.isArray(props.products) && props.products.length > 0 ? props.products : props.items || []).map((item, index) => ({
    shopifyId: pickFirstString(item?.shopifyId, item?.id, item?.shopify_variant_id),
    image: pickFirstString(item?.image, item?.image_url),
    name: pickFirstString(item?.name, item?.title, `Option ${index + 1}`),
    price: formatPriceLabel(item?.price || item?.price_amount),
  })),
  bundleCtaText: pickFirstString(props.bundleCtaText, props.ctaText, props.buttonText),
  bundleCtaLink: pickFirstString(props.bundleCtaLink, props.ctaLink, props.link, props.url),
})

const normalizeCtaProps = (props = {}) => ({
  ...props,
  text: pickFirstString(props.text, props.label, 'Shop now'),
  link: pickFirstString(props.link, props.url),
  sticky: props.sticky ?? true,
  style: props.style || 'primary',
  size: props.size || 'large',
})

const normalizeDescriptionProps = (props = {}) => ({
  ...props,
  heading: pickFirstString(props.heading, props.title, props.label),
  content: pickFirstString(props.content, props.text, props.description),
})

const normalizePriceProps = (props = {}) => ({
  ...props,
  price: formatPriceLabel(props.price || props.amount || props.text),
})

const normalizeTaglineProps = (props = {}) => ({
  ...props,
  text: pickFirstString(props.text, props.tagline, props.label),
})

const normalizeInventoryProps = (props = {}) => ({
  ...props,
  text: pickFirstString(props.text, props.message, props.customMessage),
  forceUrgent: props.forceUrgent ?? Boolean(pickFirstString(props.text, props.message, props.customMessage)),
})

const PreviewComponent = ({ component, uploads, variant = 'builder', onTrackAction }) => {
  const { type, props = {} } = component
  const onInteract = variant === 'public' && typeof onTrackAction === 'function'
    ? () => onTrackAction(type)
    : undefined

  switch (type) {
    case 'video-hero':
      return <VideoHeroPreview props={props} uploads={uploads} variant={variant} onInteract={onInteract} />
    case 'hero':
      return <VideoHeroPreview props={normalizeHeroProps(props)} uploads={uploads} variant={variant} onInteract={onInteract} />
    case 'product-bundle':
      return <ProductBundlePreview props={normalizeBundleProps(props)} variant={variant} />
    case 'comparison-table':
      return <ComparisonTablePreview props={props} variant={variant} />
    case 'inventory-tracker':
    case 'urgency_text':
      return <InventoryTrackerPreview props={normalizeInventoryProps(props)} variant={variant} />
    case 'social-proof':
      return <SocialProofPreview props={props} variant={variant} />
    case 'countdown-timer':
      return <CountdownTimerPreview props={props} variant={variant} />
    case 'cta':
      return <CtaPreview props={normalizeCtaProps(props)} variant={variant} onInteract={onInteract} />
    case 'text':
      return <TextBlockPreview props={props} variant={variant} />
    case 'description':
    case 'text-desc':
      return <DescriptionPreview props={normalizeDescriptionProps(props)} variant={variant} />
    case 'price':
      return <PricePreview props={normalizePriceProps(props)} variant={variant} />
    case 'tagline':
    case 'text-tag':
      return <TaglinePreview props={normalizeTaglineProps(props)} variant={variant} />
    case 'carousel':
    case 'gallery':
      return <CarouselPreview props={props} uploads={uploads} variant={variant} onInteract={onInteract} />
    case 'list':
      return <ListBlockPreview props={props} variant={variant} />
    case 'image':
    case 'product-image':
      return <ProductImagePreview props={props} uploads={uploads} variant={variant} />
    default:
      return null
  }
}

export default PreviewComponent
