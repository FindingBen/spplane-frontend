// Dummy data shaped like the /get_campaign_analytics/ API response.
const DEFAULT_CAMPAIGN = {
  name: 'Summer Flash Sale',
  metrics: [
    { label: 'Clicks', value: 342 },
    { label: 'page_view', value: 128 },
  ],
  total_recipients: 1200,
  delivered: 1148,
}

const METRIC_COLORS = ['bg-[#3e6ff4]', 'bg-[#60a5fa]', 'bg-[#93c5fd]', 'bg-[#bfdbfe]']

export default function CampaignTracker({ campaign = DEFAULT_CAMPAIGN }) {
  const hasCampaign = Boolean(campaign?.name)
  const metrics = campaign?.metrics ?? []
  const deliveryPct = campaign?.total_recipients
    ? Math.round((campaign.delivered / campaign.total_recipients) * 100)
    : 0
  const maxValue = Math.max(1, ...metrics.map((m) => m.value))

  if (!hasCampaign) {
    return (
      <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl p-4 md:p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white">Campaign Tracker</h3>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <svg className="w-8 h-8 text-[#60a5fa]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[#CAC4CF]">Waiting for active campaign...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl p-4 md:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white">Campaign Tracker</h3>
      </div>
      <p className="mb-4 text-xs text-[#CAC4CF] text-left">Latest campaign: {campaign?.name}</p>

      <div className="mb-4 mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-[#CAC4CF]">
          <span>Delivered</span>
          <span>{campaign?.delivered}/{campaign?.total_recipients} &middot; {deliveryPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#111827]">
          <div className="h-full rounded-full bg-[#3e6ff4]" style={{ width: `${deliveryPct}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((m, i) => {
          const pct = Math.round((m.value / maxValue) * 100)
          return (
            <div key={m.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs text-[#CAC4CF]">
                <span>{m.label}</span>
                <span className="font-medium text-white">{m.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#111827]">
                <div className={`h-full rounded-full ${METRIC_COLORS[i % METRIC_COLORS.length]}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
