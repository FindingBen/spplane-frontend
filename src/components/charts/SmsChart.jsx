import { useState } from 'react'
import { MousePointerClick, Eye, PlayCircle, Activity, Send, CheckCircle2, BarChart3, Sparkles } from 'lucide-react'

const DEFAULT_DATA = {
  name: 'test',
  metrics: [
    { label: 'Clicks', value: 1 },
    { label: 'page_view', value: 0 },
    { label: 'Video Plays', value: 0 },
  ],
  total_recipients: 1,
  delivered: 1,
}

// Map a metric label to an icon + a clean display name, without assuming a fixed metric set
function resolveMetric(label) {
  const key = label.toLowerCase()
  if (key.includes('click')) return { icon: MousePointerClick, name: 'Clicks' }
  if (key.includes('video') || key.includes('play')) return { icon: PlayCircle, name: 'Video Plays' }
  if (key.includes('view') || key.includes('open')) return { icon: Eye, name: 'Page Views' }
  return { icon: Activity, name: label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }
}

export default function SmsChart({ data = DEFAULT_DATA }) {
  const [view, setView] = useState('delivery') // 'delivery' | 'engagement'

  const { name, metrics = [], total_recipients = 0, delivered = 0 } = data
  const deliveryRate = total_recipients ? Math.round((delivered / total_recipients) * 100) : 0
  const maxBar = Math.max(total_recipients, delivered, 1)

  return (
    <div className="bg-[#1f2937] border border-[#3e6ff4]/30 rounded-2xl p-4 md:p-5 w-full max-w-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white capitalize">Overall analytics</h3>
          <p className="text-xs text-[#CAC4CF]">{view === 'delivery' ? 'Sent vs delivered' : 'Engagement'}</p>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg bg-black/20 p-0.5">
          <button
            type="button"
            onClick={() => setView('delivery')}
            aria-pressed={view === 'delivery'}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              view === 'delivery' ? 'bg-[#3e6ff4] text-white' : 'text-[#CAC4CF] hover:text-white'
            }`}
          >
            <BarChart3 className="h-3 w-3" /> Delivery
          </button>
          <button
            type="button"
            onClick={() => setView('engagement')}
            aria-pressed={view === 'engagement'}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              view === 'engagement' ? 'bg-[#3e6ff4] text-white' : 'text-[#CAC4CF] hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3" /> Engagement
          </button>
        </div>
      </div>

      {view === 'delivery' ? (
        <div>
          {/* Sent vs delivered, side-by-side bars */}
          <div className="flex h-32 items-end justify-center gap-8">
            <div className="flex h-full flex-col items-center justify-end gap-1.5">
              <span className="text-sm font-bold text-white">{total_recipients}</span>
              <div
                className="w-10 rounded-t-md bg-[#3e6ff4]/35"
                style={{ height: `${(total_recipients / maxBar) * 100}%`, transition: 'height 500ms ease' }}
              />
              <span className="flex items-center gap-1 text-[10px] text-[#CAC4CF]">
                <Send className="h-3 w-3" /> Sent
              </span>
            </div>
            <div className="flex h-full flex-col items-center justify-end gap-1.5">
              <span className="text-sm font-bold text-white">{delivered}</span>
              <div
                className="w-10 rounded-t-md bg-[#3e6ff4]"
                style={{ height: `${(delivered / maxBar) * 100}%`, transition: 'height 500ms ease' }}
              />
              <span className="flex items-center gap-1 text-[10px] text-[#CAC4CF]">
                <CheckCircle2 className="h-3 w-3" /> Delivered
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-[#3e6ff4]/10 pt-3 text-xs">
            <span className="text-[#CAC4CF]">Delivery rate</span>
            <span className="font-bold text-[#3e6ff4]">{deliveryRate}%</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 py-2">
          {metrics.map((m) => {
            const { icon: Icon, name: displayName } = resolveMetric(m.label)
            return (
              <div key={m.label} className="flex flex-col items-center gap-1 rounded-xl bg-black/15 px-2 py-4 text-center">
                <Icon className="h-4 w-4 text-[#3e6ff4]" />
                <span className="text-sm font-bold text-white">{m.value}</span>
                <span className="text-[9px] uppercase tracking-wide text-[#CAC4CF] leading-tight">{displayName}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
