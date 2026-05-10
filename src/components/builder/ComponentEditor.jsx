import { VideoHeroEditor } from './VideoHeroBlock'
import { ProductBundleEditor } from './ProductBundleBlock'
import { ComparisonTableEditor } from './ComparisonTableBlock'
import { InventoryTrackerEditor } from './InventoryTrackerBlock'
import { SocialProofEditor } from './SocialProofBlock'
import { CountdownTimerEditor } from './CountdownTimerBlock'
import { CtaEditor } from './CtaBlock'
import { TextBlockEditor } from './TextBlock'

const ComponentEditor = ({ component, uploads, onUpdate, onUploadChange }) => {
  const { type, props = {} } = component

  const onChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2 uppercase">Block Type</label>
        <div className="text-sm text-white bg-[#111827] p-2 rounded border border-[#3e6ff4]/20">
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
    </div>
  )
}

export default ComponentEditor
