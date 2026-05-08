// CountdownTimerBlock — Live countdown to a deadline

import { useState, useEffect } from 'react'

const getCountdownTime = (endTime, now = Date.now()) => {
  const diff = new Date(endTime) - now
  if (!endTime || diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    s: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

const useCountdown = (endTime) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  return getCountdownTime(endTime, now)
}

export const CountdownTimerPreview = ({ props = {}, variant = 'builder' }) => {
  const time = useCountdown(props.endTime)
  const isPublic = variant === 'public'

  return (
    <div className={isPublic ? 'w-full px-5 py-5 bg-white' : 'w-full px-3 py-3 bg-white'}>
      {props.title && (
        <p className={isPublic ? 'text-base font-bold text-black text-center mb-4' : 'text-[10px] font-bold text-black text-center mb-2'}>{props.title}</p>
      )}
      <div className={isPublic ? 'flex justify-center gap-3' : 'flex justify-center gap-2'}>
        {[
          { label: 'Days', value: time?.d ?? 0 },
          { label: 'Hrs', value: time?.h ?? 0 },
          { label: 'Min', value: time?.m ?? 0 },
          { label: 'Sec', value: time?.s ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className={isPublic ? 'flex flex-col items-center bg-red-600 text-white rounded-2xl px-3 py-2 min-w-[58px] shadow-sm' : 'flex flex-col items-center bg-red-600 text-white rounded px-2 py-1 min-w-[34px]'}>
            <span className={isPublic ? 'text-2xl font-bold leading-tight' : 'text-sm font-bold leading-tight'}>{String(value).padStart(2, '0')}</span>
            <span className={isPublic ? 'text-[10px] uppercase tracking-[0.16em]' : 'text-[8px] uppercase tracking-wide'}>{label}</span>
          </div>
        ))}
      </div>
      {props.message && (
        <p className={isPublic ? 'text-sm text-gray-500 text-center mt-4 leading-6' : 'text-[9px] text-gray-500 text-center mt-2'}>{props.message}</p>
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
