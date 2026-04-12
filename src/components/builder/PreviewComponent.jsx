import { VideoHeroPreview } from './VideoHeroBlock'
import { ProductBundlePreview } from './ProductBundleBlock'
import { ComparisonTablePreview } from './ComparisonTableBlock'
import { InventoryTrackerPreview } from './InventoryTrackerBlock'
import { SocialProofPreview } from './SocialProofBlock'
import { CountdownTimerPreview } from './CountdownTimerBlock'
import { CtaPreview } from './CtaBlock'

const PreviewComponent = ({ component }) => {
  const { type, props = {} } = component

  switch (type) {
    case 'video-hero':
      return <VideoHeroPreview props={props} />
    case 'product-bundle':
      return <ProductBundlePreview props={props} />
    case 'comparison-table':
      return <ComparisonTablePreview props={props} />
    case 'inventory-tracker':
      return <InventoryTrackerPreview props={props} />
    case 'social-proof':
      return <SocialProofPreview props={props} />
    case 'countdown-timer':
      return <CountdownTimerPreview props={props} />
    case 'cta':
      return <CtaPreview props={props} />
    default:
      return null
  }
}

export default PreviewComponent
