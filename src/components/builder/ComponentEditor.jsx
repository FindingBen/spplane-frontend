import { VideoHeroEditor } from './VideoHeroBlock'
import { ProductBundleEditor } from './ProductBundleBlock'
import { ComparisonTableEditor } from './ComparisonTableBlock'
import { InventoryTrackerEditor } from './InventoryTrackerBlock'
import { SocialProofEditor } from './SocialProofBlock'
import { CountdownTimerEditor } from './CountdownTimerBlock'
import { CtaEditor } from './CtaBlock'
import { TextBlockEditor } from './TextBlock'
import { ProductImageEditor } from './ProductImageBlock'
import { CarouselEditor } from './CarouselBlock'
import { ListBlockEditor } from './ListBlock'
import { DescriptionEditor } from './DescriptionBlock'
import { PriceEditor } from './PriceBlock'
import { TaglineEditor } from './TaglineBlock'

const ComponentEditor = ({ component, uploads, onUpdate, onUploadChange }) => {
  const { type, props = {} } = component

  const onChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2 uppercase">Block Type</label>
        <div className="text-xs text-white bg-[#111827] p-2 rounded border border-[#3e6ff4]/20">
          {type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </div>
      </div>

      {type === 'video-hero' && (
        <VideoHeroEditor props={props} uploads={uploads} onChange={onChange} onUploadChange={onUploadChange} />
      )}
      {type === 'product-bundle' && <ProductBundleEditor props={props} onChange={onChange} />}
      {type === 'comparison-table' && <ComparisonTableEditor props={props} onChange={onChange} />}
      {type === 'inventory-tracker' && <InventoryTrackerEditor props={props} onChange={onChange} />}
      {type === 'social-proof' && <SocialProofEditor props={props} onChange={onChange} />}
      {type === 'countdown-timer' && <CountdownTimerEditor props={props} onChange={onChange} />}
      {type === 'cta' && <CtaEditor props={props} onChange={onChange} />}
      {type === 'text' && <TextBlockEditor props={props} onChange={onChange} />}
      {type === 'description' && <DescriptionEditor props={props} onChange={onChange} />}
      {type === 'price' && <PriceEditor props={props} onChange={onChange} />}
      {type === 'tagline' && <TaglineEditor props={props} onChange={onChange} />}
      {(type === 'carousel' || type === 'gallery') && <CarouselEditor props={props} uploads={uploads} onChange={onChange} onUploadChange={onUploadChange} />}
      {type === 'list' && <ListBlockEditor props={props} onChange={onChange} />}
      {type === 'image' && <ProductImageEditor props={props} uploads={uploads} onChange={onChange} onUploadChange={onUploadChange} />}
    </div>
  )
}

export default ComponentEditor
