// InventoryTrackerBlock — Live stock count from Shopify (simulated in builder)

export const InventoryTrackerPreview = ({ props = {} }) => {
  const sampleRemaining = 3
  const isUrgent = sampleRemaining <= (props.urgencyThreshold || 5)
  const message = isUrgent
    ? (props.urgencyMessage || 'Last {remaining} available - order now!').replace('{remaining}', sampleRemaining)
    : (props.messageTemplate || 'Only {remaining} left in stock!').replace('{remaining}', sampleRemaining)

  return (
    <div className={`w-full px-3 py-2 ${isUrgent ? 'bg-red-50' : 'bg-orange-50'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUrgent ? 'bg-red-500' : 'bg-orange-400'} animate-pulse`} />
        <p className={`text-[10px] font-semibold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>{message}</p>
      </div>
      {props.shopifyProductId && (
        <p className="text-[9px] text-gray-400 mt-0.5 truncate">ID: {props.shopifyProductId}</p>
      )}
    </div>
  )
}

export const InventoryTrackerEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Shopify Product ID</label>
      <input type="text" value={props.shopifyProductId || ''} onChange={(e) => onChange('shopifyProductId', e.target.value)}
        placeholder="gid://shopify/Product/123"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Message Template</label>
      <input type="text" value={props.messageTemplate || ''} onChange={(e) => onChange('messageTemplate', e.target.value)}
        placeholder="Only {remaining} left in stock!"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
      <p className="text-[10px] text-[#CAC4CF]/60 mt-1">Use {'{remaining}'} as a placeholder</p>
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Urgency Threshold</label>
      <input type="number" value={props.urgencyThreshold ?? 5} min="1"
        onChange={(e) => onChange('urgencyThreshold', parseInt(e.target.value))}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Urgency Message</label>
      <input type="text" value={props.urgencyMessage || ''} onChange={(e) => onChange('urgencyMessage', e.target.value)}
        placeholder="Last {remaining} available - order now!"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Refresh Interval (ms)</label>
      <input type="number" value={props.refreshIntervalMs ?? 30000} min="5000" step="5000"
        onChange={(e) => onChange('refreshIntervalMs', parseInt(e.target.value))}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
    </div>
  </>
)
