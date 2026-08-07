const Loader = ({ message = 'Processing...', detail = '' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(62,111,244,0.18),_rgba(0,0,0,0.82)_55%)] backdrop-blur-md">
      <div className="relative flex max-w-md flex-col items-center gap-5 overflow-hidden rounded-[28px] border border-[#3e6ff4]/30 bg-[#111827]/95 px-10 py-9 text-center shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#60a5fa] to-transparent" />

        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#3e6ff4]/20 bg-[#3e6ff4]/10" />
          <div className="absolute inset-[6px] rounded-full border-4 border-[#3e6ff4]/15" />
          <div className="absolute inset-[6px] rounded-full border-4 border-transparent border-t-[#3e6ff4] border-r-[#60a5fa] animate-spin" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_18px_rgba(96,165,250,0.8)]" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wide text-white">{message}</p>
          {detail && (
            <p className="mt-2 max-w-sm text-xs leading-6 text-[#CAC4CF]">{detail}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-[#60a5fa]">
          <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
        </div>
      </div>
    </div>
  )
}

export default Loader
