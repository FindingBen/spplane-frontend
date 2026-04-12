// CountdownTimerBlock — Live countdown to a deadline

import { useState, useEffect } from 'react'

const useCountdown = (endTime) => {
  const calculate = () => {
    const diff = new Date(endTime) - new Date()
    if (!endTime || diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }

  const [time, setTime] = useState(calculate)

  useEffect(() => {
    setTime(calculate())
    const interval = setInterval(() => setTime(calculate()), 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return time
}

export const CountdownTimerPreview = ({ props = {} }) => {
  const time = useCountdown(props.endTime)

  return (
    <div className="w-full px-3 py-3 bg-white">
      {props.title && (
        <p className="text-[10px] font-bold text-black text-center mb-2">{props.title}</p>
      )}
      <div className="flex justify-center gap-2">
        {[
          { label: 'Days', value: time?.d ?? 0 },
          { label: 'Hrs', value: time?.h ?? 0 },
          { label: 'Min', value: time?.m ?? 0 },
          { label: 'Sec', value: time?.s ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center bg-red-600 text-white rounded px-2 py-1 min-w-[34px]">
            <span className="text-sm font-bold leading-tight">{String(value).padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>
      {props.message && (
        <p className="text-[9px] text-gray-500 text-center mt-2">{props.message}</p>
      )}
    </div>
  )
}

export const CountdownTimerEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Title</label>
      <input type="text" value={props.title || ''} onChange={(e) => onChange('title', e.target.value)}
        placeholder="Flash Sale Ends In:"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">End Date & Time</label>
      <input
        type="datetime-local"
        value={props.endTime ? props.endTime.slice(0, 16) : ''}
        onChange={(e) => onChange('endTime', e.target.value ? new Date(e.target.value).toISOString() : '')}
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Sub-message</label>
      <input type="text" value={props.message || ''} onChange={(e) => onChange('message', e.target.value)}
        placeholder="Sale ends soon - grab yours now!"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60" />
    </div>
  </>
)
