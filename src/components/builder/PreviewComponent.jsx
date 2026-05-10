import { VideoHeroPreview } from './VideoHeroBlock'
import { ProductBundlePreview } from './ProductBundleBlock'
import { ComparisonTablePreview } from './ComparisonTableBlock'
import { InventoryTrackerPreview } from './InventoryTrackerBlock'
import { SocialProofPreview } from './SocialProofBlock'
import { CountdownTimerPreview } from './CountdownTimerBlock'
import { CtaPreview } from './CtaBlock'
import { TextBlockPreview } from './TextBlock'

const PreviewComponent = ({ component, uploads, variant = 'builder' }) => {
  const { type, props = {} } = component

  switch (type) {
    case 'video-hero':
      return <VideoHeroPreview props={props} uploads={uploads} variant={variant} />
    case 'product-bundle':
      return <ProductBundlePreview props={props} variant={variant} />
    case 'comparison-table':
      return <ComparisonTablePreview props={props} variant={variant} />
    case 'inventory-tracker':
      return <InventoryTrackerPreview props={props} variant={variant} />
    case 'social-proof':
      return <SocialProofPreview props={props} variant={variant} />
    case 'countdown-timer':
      return <CountdownTimerPreview props={props} variant={variant} />
    case 'cta':
      return <CtaPreview props={props} variant={variant} />
    case 'text':
      return <TextBlockPreview props={props} variant={variant} />
    default:
      return null
  }
}

export default PreviewComponent
