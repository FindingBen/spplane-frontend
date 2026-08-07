const DEFAULT_DATA = [
  { name: 'Summer Sale', spend: 42.5, delivered: 1148 },
  { name: 'Restock Alert', spend: 18.2, delivered: 512 },
  { name: 'VIP Drop', spend: 65.9, delivered: 1890 },
  { name: 'Cart Reminder', spend: 27.4, delivered: 780 },
]

export default function CampaignSpendChart({ data = DEFAULT_DATA }) {
  const maxSpend = Math.max(...data.map((d) => d.spend), 1)
  const maxDelivered = Math.max(...data.map((d) => d.delivered), 1)
  const totalSpend = data.reduce((sum, d) => sum + d.spend, 0)

  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white">Campaign Volume &amp; Spend</h3>
          <p className="text-xs text-[#CAC4CF]">Credits spent vs delivered results</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-[#3e6ff4]">${totalSpend.toFixed(2)}</p>
          <p className="text-[10px] uppercase tracking-wide text-[#CAC4CF]">Total spend</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.name}>
            <div className="mb-1 flex items-center justify-between text-xs text-[#CAC4CF]">
              <span className="truncate">{d.name}</span>
              <span className="font-medium text-white">${d.spend.toFixed(2)} &middot; {d.delivered} delivered</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#111827]">
                <div className="h-full rounded-full bg-[#60a5fa]" style={{ width: `${(d.spend / maxSpend) * 100}%` }} />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#111827]">
                <div className="h-full rounded-full bg-[#3e6ff4]" style={{ width: `${(d.delivered / maxDelivered) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-[#3e6ff4]/10 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-[#CAC4CF]">
          <span className="h-2 w-2 rounded-full bg-[#60a5fa]" /> Spend
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#CAC4CF]">
          <span className="h-2 w-2 rounded-full bg-[#3e6ff4]" /> Delivered
        </span>
      </div>
    </div>
  )
}
