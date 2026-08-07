import { useEffect, useMemo, useState } from 'react'
import { getWallet } from '../service/api/wallet'

const numberFmt = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const toNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const WalletCreditsPill = () => {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchWallet = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      setError('')
      const data = await getWallet()
      setWallet(data)
    } catch {
      setError('Unable to load credits')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const availableCredits = useMemo(() => {
    if (!wallet) return 0
    const balance = toNumber(wallet.balance)
    const reserved = toNumber(wallet.reserved)
    const available = balance - reserved
    return available > 0 ? available : 0
  }, [wallet])

  const reservedCredits = useMemo(() => toNumber(wallet?.reserved), [wallet])

  const label = loading
    ? 'Loading...'
    : error
      ? 'Credits unavailable'
      : numberFmt.format(availableCredits)

  return (
    <button
      type="button"
      onClick={() => fetchWallet(true)}
      className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1619] border border-[#3e6ff4]/40 text-[#dbeafe] shadow-[0_0_0_1px_rgba(62,111,244,0.1)] hover:from-[#3e6ff4]/30 hover:to-[#60a5fa]/30 hover:border-[#60a5fa]/70 transition-all duration-200 cursor-pointer"
      title="Credits available. Click to refresh."
      aria-label="Credits available. Click to refresh"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      <span className="text-[11px] uppercase tracking-wide text-[#bfdbfe]/90">Credits</span>
      <span className="text-xs font-semibold text-white min-w-[3.2rem] text-right">
        {label}
      </span>

      {!loading && !error && (
        <span className="text-[10px] text-[#93c5fd]/80 border-l border-[#3e6ff4]/30 pl-2">
          Reserved {numberFmt.format(reservedCredits)}
        </span>
      )}

      {refreshing && (
        <svg className="w-3.5 h-3.5 text-[#93c5fd] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
    </button>
  )
}

export default WalletCreditsPill
