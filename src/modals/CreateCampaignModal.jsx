import { useEffect, useMemo, useState } from 'react'
import { getContents } from '../service/api/campaign'
import { useFirstCampaignGuide } from '../guide/FirstCampaignGuideProvider'

const INITIAL_FORM = {
  name: '',
  description: '',
  content: '',
}

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const IMAGE_PROP_KEYS = ['image', 'image_url', 'fallbackImage', 'posterImage', 'backgroundImage']

const extractBlockImage = (block) => {
  const props = block?.props || {}
  const direct = pickFirstString(...IMAGE_PROP_KEYS.map((key) => props[key]))
  if (direct) return direct

  for (const arr of [props.images, props.products, props.items]) {
    if (Array.isArray(arr)) {
      for (const entry of arr) {
        const nested = pickFirstString(typeof entry === 'string' ? entry : '', entry?.image, entry?.image_url)
        if (nested) return nested
      }
    }
  }

  return ''
}

const normalizeContent = (item) => {
  const structure = item?.structure || item?.content_snapshot || item?.snapshot || {}
  const metadata = (structure?.metadata && typeof structure.metadata === 'object') ? structure.metadata : {}
  const blocks = Array.isArray(structure?.blocks) ? structure.blocks : []

  return {
    id: item.id,
    title: pickFirstString(item?.name, item?.title, metadata?.name, item?.id ? `Content #${item.id}` : 'Untitled content'),
    imageUrl: blocks.map(extractBlockImage).find(Boolean) || '',
    blockCount: blocks.length,
  }
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

  const normalizedContents = useMemo(() => contents.map(normalizeContent), [contents])

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
              <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-[#3e6ff4]/30 bg-[#111827] p-2">
                <button
                  type="button"
                  onClick={() => field('content', '')}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                    !form.content
                      ? 'border-[#3e6ff4] bg-[#3e6ff4]/20 text-white'
                      : 'border-transparent text-[#CAC4CF] hover:bg-[#3e6ff4]/10'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-[#3e6ff4]/30 text-[#CAC4CF]/40">
                    —
                  </div>
                  No linked content
                </button>

                {normalizedContents.map((content) => {
                  const selected = String(form.content) === String(content.id)
                  return (
                    <button
                      key={content.id}
                      type="button"
                      onClick={() => field('content', String(content.id))}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                        selected
                          ? 'border-[#3e6ff4] bg-[#3e6ff4]/20 text-white'
                          : 'border-transparent text-[#CAC4CF] hover:bg-[#3e6ff4]/10'
                      }`}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#1D1A22]">
                        {content.imageUrl ? (
                          <img src={content.imageUrl} alt={content.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-[#CAC4CF]/40">
                            No preview
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{content.title}</p>
                        <p className="text-[10px] text-[#CAC4CF]/50">
                          {content.blockCount} block{content.blockCount === 1 ? '' : 's'}
                        </p>
                      </div>
                      {selected && (
                        <svg className="h-4 w-4 shrink-0 text-[#3e6ff4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}

                {normalizedContents.length === 0 && (
                  <p className="px-3 py-2 text-xs text-[#CAC4CF]/50">No content available yet.</p>
                )}
              </div>
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