const DEFAULT_CAMPAIGN = {
  name: 'Summer Flash Sale',
  status: 'Sending',
  sent: 1200,
  delivered: 1148,
  metrics: [
    { label: 'Clicks', value: 342, target: 1148, color: 'bg-[#3e6ff4]' },
    { label: 'View Retention', value: 78, target: 100, suffix: '%', color: 'bg-[#60a5fa]' },
    { label: 'Link Clicks', value: 210, target: 1148, color: 'bg-[#93c5fd]' },
  ],
}

export default function CampaignTracker({ campaign = DEFAULT_CAMPAIGN }) {
  const deliveryPct = campaign.sent ? Math.round((campaign.delivered / campaign.sent) * 100) : 0

  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl p-4 md:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white">Campaign Tracker</h3>
        <span className="rounded-full border border-[#3e6ff4]/30 bg-[#3e6ff4]/15 px-2 py-0.5 text-[10px] font-medium text-[#60a5fa]">
          {campaign.status}
        </span>
      </div>
      <p className="mb-4 text-xs text-[#CAC4CF]">{campaign.name}</p>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-[#CAC4CF]">
          <span>Delivered</span>
          <span>{campaign.delivered}/{campaign.sent} &middot; {deliveryPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#111827]">
          <div className="h-full rounded-full bg-[#3e6ff4]" style={{ width: `${deliveryPct}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {campaign.metrics.map((m) => {
          const pct = m.target ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0
          return (
            <div key={m.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs text-[#CAC4CF]">
                <span>{m.label}</span>
                <span className="font-medium text-white">{m.value}{m.suffix ?? ''}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#111827]">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
