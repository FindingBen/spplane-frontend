import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {optOutCustomer} from "../service/api/segments"

const SmsOptOutPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleUnsubscribe = async () => {
    if (!token || isSubmitting || completed) return
  
    setIsSubmitting(true)

    try {
      const response = await optOutCustomer(token)
      await new Promise((resolve) => setTimeout(resolve, 450))
      setCompleted(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  console.log("AAA",token)
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#090921] via-[#111827] to-[#1D1A22] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(62,111,244,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(73,55,186,0.16),_transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#111827]/90 p-6 text-center shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93c5fd]">SMS Preferences</p>

          {!token ? (
            <>
              <h1 className="mt-4 text-2xl font-semibold text-white">Invalid unsubscribe link</h1>
              <p className="mt-3 text-xs leading-6 text-[#CAC4CF]">
                This opt-out link is missing a token. Please use the unsubscribe link from your SMS message.
              </p>
            </>
          ) : completed ? (
            <>
              <h1 className="mt-4 text-2xl font-semibold text-white">You are unsubscribed</h1>
              <p className="mt-3 text-xs leading-6 text-[#CAC4CF]">
                You will no longer receive SMS messages from this sender.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-2xl font-semibold text-white">Unsubscribe from SMS?</h1>
              <p className="mt-3 text-xs leading-6 text-[#CAC4CF]">
                Are you sure you want to unsubscribe?
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-6 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Unsubscribing...' : 'Yes, unsubscribe me'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default SmsOptOutPage
