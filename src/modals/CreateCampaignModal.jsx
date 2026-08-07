import { useEffect, useState } from 'react'
import { getContents } from '../service/api/campaign'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

const INITIAL_FORM = {
  name: '',
  description: '',
  content: '',
}

function CreateCampaignModal({
  onClose,
  onCreate,
  submitting,
  title = 'Create New Campaign',
  submitLabel = 'Save Draft',
  initialValues = {},
}) {
  const { active, currentStepId } = useFirstCampaignGuide()
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, ...initialValues }))
  const [errors, setErrors] = useState({})
  const [contents, setContents] = useState([])
  const [contentsLoading, setContentsLoading] = useState(true)
  const isGuideLocked = active && currentStepId === 'campaign-form'

  useEffect(() => {
    getContents()
      .then((data) => setContents(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => setContents([]))
      .finally(() => setContentsLoading(false))
  }, [])

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Campaign name is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onCreate(form)
  }

  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isGuideLocked ? undefined : onClose} />

      <div data-guide-id="campaign-form" className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#3e6ff4]/30 bg-gradient-to-br from-[#1f2937] to-[#1D1A22] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#3e6ff4]/20 px-6 py-4">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            disabled={isGuideLocked}
            className="rounded-lg p-1 text-[#CAC4CF] transition-colors hover:bg-[#3e6ff4]/20 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-1 block text-xs text-[#CAC4CF]">Campaign Name</label>
            <input
              type="text"
              placeholder="e.g. Summer Flash Sale"
              value={form.name}
              onChange={(event) => {
                field('name', event.target.value)
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              className="w-full rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5 text-xs text-white outline-none transition-colors placeholder:text-[#CAC4CF]/50 focus:border-[#3e6ff4]"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#CAC4CF]">
              Content
              <span className="ml-2 text-xs text-[#3e6ff4]/70">Optional - link an existing content</span>
            </label>
            {contentsLoading ? (
              <div className="flex w-full items-center gap-2 rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3e6ff4]/30 border-t-[#3e6ff4]" />
                <span className="text-xs text-[#CAC4CF]/50">Loading content...</span>
              </div>
            ) : (
              <select
                value={form.content}
                onChange={(event) => field('content', event.target.value)}
                className="w-full rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5 text-xs text-white outline-none transition-colors focus:border-[#3e6ff4]"
              >
                <option value="">None</option>
                {contents.map((content) => (
                  <option key={content.id} value={content.id}>
                    {content.name || content.title || `Content #${content.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#CAC4CF]">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the goal and audience of this campaign..."
              value={form.description}
              onChange={(event) => {
                field('description', event.target.value)
                setErrors((prev) => ({ ...prev, description: '' }))
              }}
              className="w-full resize-none rounded-lg border border-[#3e6ff4]/30 bg-[#111827] px-4 py-2.5 text-xs text-white outline-none transition-colors placeholder:text-[#CAC4CF]/50 focus:border-[#3e6ff4]"
            />
            <div className="mt-1 flex justify-between">
              {errors.description ? <p className="text-xs text-red-400">{errors.description}</p> : <span />}
              <span className="text-xs text-[#CAC4CF]/50">{form.description.length} chars</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#3e6ff4]/30 py-2.5 text-xs font-medium text-[#CAC4CF] transition-all duration-200 hover:border-[#3e6ff4]/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCampaignModal