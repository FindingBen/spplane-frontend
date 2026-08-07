const DEFAULT_DATA = [
  { day: 'Mon', sent: 420, delivered: 398 },
  { day: 'Tue', sent: 512, delivered: 486 },
  { day: 'Wed', sent: 388, delivered: 371 },
  { day: 'Thu', sent: 640, delivered: 601 },
  { day: 'Fri', sent: 574, delivered: 552 },
  { day: 'Sat', sent: 310, delivered: 298 },
  { day: 'Sun', sent: 265, delivered: 260 },
]

export default function SmsChart({ data = DEFAULT_DATA }) {
  const max = Math.max(...data.flatMap((d) => [d.sent, d.delivered]), 1)
  const totalSent = data.reduce((sum, d) => sum + d.sent, 0)
  const totalDelivered = data.reduce((sum, d) => sum + d.delivered, 0)
  const deliveryRate = totalSent ? Math.round((totalDelivered / totalSent) * 100) : 0

  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white">SMS Delivery</h3>
          <p className="text-xs text-[#CAC4CF]">Sent vs delivered, last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-[#3e6ff4]">{deliveryRate}%</p>
          <p className="text-[10px] uppercase tracking-wide text-[#CAC4CF]">Delivery rate</p>
        </div>
      </div>

      <div className="flex h-28 items-end justify-between gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div className="flex h-full w-full items-end justify-center gap-0.5">
              <div
                className="w-2.5 rounded-t bg-[#3e6ff4]/35"
                style={{ height: `${(d.sent / max) * 100}%` }}
                title={`Sent: ${d.sent}`}
              />
              <div
                className="w-2.5 rounded-t bg-[#3e6ff4]"
                style={{ height: `${(d.delivered / max) * 100}%` }}
                title={`Delivered: ${d.delivered}`}
              />
            </div>
            <span className="text-[10px] text-[#CAC4CF]">{d.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-[#3e6ff4]/10 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-[#CAC4CF]">
          <span className="h-2 w-2 rounded-full bg-[#3e6ff4]/35" /> Sent
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#CAC4CF]">
          <span className="h-2 w-2 rounded-full bg-[#3e6ff4]" /> Delivered
        </span>
      </div>
    </div>
  )
}
