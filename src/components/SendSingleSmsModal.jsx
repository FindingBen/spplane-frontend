import { useState } from 'react'

const FIRST_NAME_TOKEN = '{{first_name}}'

const inputCls =
  'w-full rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#CAC4CF]/50 focus:border-[#3e6ff4]'

const textareaCls =
  'min-h-[140px] w-full resize-none rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#CAC4CF]/50 focus:border-[#3e6ff4]'

function SendSingleSmsModal({ customer, onClose, onSend, sending }) {
  const [form, setForm] = useState({ sms_sender: '', sms_body: '' })
  const [error, setError] = useState('')

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setError('')
  }

  const appendFirstName = () => {
    const suffix = form.sms_body && !form.sms_body.endsWith(' ') ? ` ${FIRST_NAME_TOKEN}` : FIRST_NAME_TOKEN
    setForm((prev) => ({ ...prev, sms_body: `${prev.sms_body}${suffix}`.trim() }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.sms_sender.trim()) {
      setError('Sender name is required.')
      return
    }

    if (!form.sms_body.trim()) {
      setError('Text message is required.')
      return
    }

    try {
      await onSend({
        customer_id: customer.id,
        sender: form.sms_sender.trim(),
        body: form.sms_body.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Failed to send SMS.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={sending ? undefined : onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#3e6ff4]/30 bg-gradient-to-br from-[#1f2937] to-[#1D1A22] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#3e6ff4]/20 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Send SMS</h2>
            <p className="mt-1 text-sm text-[#CAC4CF]">{customer.first_name || customer.last_name ? `${[customer.first_name, customer.last_name].filter(Boolean).join(' ')} • ` : ''}{customer.phone}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-lg p-1.5 text-[#CAC4CF] transition-colors hover:bg-[#3e6ff4]/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#CAC4CF]">Sender Name</label>
            <input
              type="text"
              value={form.sms_sender}
              onChange={setField('sms_sender')}
              maxLength={50}
              placeholder="Your brand"
              className={inputCls}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-[#CAC4CF]">Text Message</label>
              <button
                type="button"
                onClick={appendFirstName}
                className="rounded-full border border-[#3e6ff4]/25 bg-[#3e6ff4]/10 px-3 py-1 text-xs font-medium text-[#60a5fa] transition-colors hover:bg-[#3e6ff4]/20"
              >
                Insert First Name
              </button>
            </div>
            <textarea
              value={form.sms_body}
              onChange={setField('sms_body')}
              maxLength={1600}
              placeholder={`Write your message... ${FIRST_NAME_TOKEN}`}
              className={textareaCls}
            />
            <div className="mt-1 text-right text-xs text-[#CAC4CF]/60">{form.sms_body.length}/1600</div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#CAC4CF] transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 px-4 py-2 text-sm font-semibold text-[#60a5fa] transition-colors hover:bg-[#3e6ff4]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending...
                </>
              ) : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SendSingleSmsModal