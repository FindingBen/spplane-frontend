const Loader = ({ message = 'Processing...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 bg-[#1D1A22] border border-[#3e6ff4]/30 rounded-2xl px-10 py-8 shadow-2xl">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#3e6ff4]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#3e6ff4] border-r-[#60a5fa] animate-spin" />
        </div>

        <p className="text-white text-sm font-medium tracking-wide">{message}</p>
      </div>
    </div>
  )
}

export default Loader
