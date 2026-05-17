import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import PreviewComponent from '../components/builder/PreviewComponent'
import { deleteMyContent, getMyContents } from '../service/api/content'

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const getCollectionItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

  if (Array.isArray(payload?.contents)) {
    return payload.contents
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

const getStructure = (item = {}) => {
  if (item?.structure && typeof item.structure === 'object') {
    return item.structure
  }

  if (item?.content_snapshot && typeof item.content_snapshot === 'object') {
    return item.content_snapshot
  }

  if (item?.snapshot && typeof item.snapshot === 'object') {
    return item.snapshot
  }

  return {}
}

const normalizeContents = (payload) => getCollectionItems(payload).map((item) => {
  const structure = getStructure(item)
  const metadata = structure?.metadata && typeof structure.metadata === 'object' ? structure.metadata : {}
  const blocks = Array.isArray(structure?.blocks) ? structure.blocks : []
  const template = item?.template
  const templateId = typeof template === 'object' ? template?.id : template
  const templateLabel = typeof template === 'object'
    ? pickFirstString(template?.name, template?.title, templateId ? `Template #${templateId}` : '')
    : templateId
      ? `Template #${templateId}`
      : 'No template'

  return {
    ...item,
    title: pickFirstString(item?.name, item?.title, metadata?.name, item?.slug, item?.id ? `Content #${item.id}` : 'Untitled content'),
    description: pickFirstString(item?.description, metadata?.description),
    status: pickFirstString(item?.status, item?.publish_status, 'draft').toLowerCase(),
    structure,
    metadata,
    blocks,
    blockCount: blocks.length,
    templateId,
    templateLabel,
    structureType: pickFirstString(structure?.type, item?.type, 'sms-landing-page'),
    version: pickFirstString(structure?.version, item?.version, '1'),
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
    smsOfferEnabled: Boolean(metadata?.smsExclusiveOffer?.enabled),
  }
})

const formatDateTime = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ContentStatusBadge({ status }) {
  const styles = {
    draft: 'border border-[#CAC4CF]/20 bg-[#CAC4CF]/10 text-[#CAC4CF]',
    published: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    active: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    archived: 'border border-amber-500/40 bg-amber-500/15 text-amber-300',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] || styles.draft}`}>
      {status || 'draft'}
    </span>
  )
}

function ContentPreviewCard({ blocks, smsOfferEnabled, smsOfferLabel }) {
  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[28px] border-[12px] border-gray-900 bg-gray-900 shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
      <div className="h-[340px] overflow-hidden rounded-[18px] bg-white">
        {smsOfferEnabled && (
          <div className="bg-green-700 px-3 py-1 text-center text-[9px] font-semibold text-white">
            {smsOfferLabel || 'SMS Exclusive Offer Enabled'}
          </div>
        )}
        <div className="pointer-events-none h-full overflow-hidden">
          {blocks.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-xs text-gray-400">
              No content blocks yet.
            </div>
          ) : (
            blocks.slice(0, 4).map((block, index) => (
              <PreviewComponent key={block?.id ?? `${block?.type ?? 'block'}-${index}`} component={block} variant="builder" />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-xl border border-[#3e6ff4]/15 bg-[#111827]/70 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#93c5fd]/75">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}

function DeleteConfirmationModal({ content, deleting, error, onCancel, onConfirm }) {
  if (!content) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={deleting ? undefined : onCancel} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/25 bg-gradient-to-br from-[#1f2937] to-[#111827] shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
        <div className="border-b border-red-500/15 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-200/70">Delete content</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Remove this content?</h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-[#CAC4CF]">
            <span className="font-semibold text-white">{content.title}</span> will be permanently deleted from your content list.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#CAC4CF]/85">
            This action cannot be undone.
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 rounded-xl border border-[#3e6ff4]/20 bg-[#111827]/70 px-4 py-3 text-sm font-semibold text-[#CAC4CF] transition-colors hover:border-[#3e6ff4]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentCard({ content, deleting, onDeleteClick }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#3e6ff4]/20 bg-[#1f2937] shadow-[0_18px_45px_rgba(2,6,23,0.22)]">
      <div className="flex flex-col gap-0 xl:flex-row">
        <div className="border-b border-[#3e6ff4]/15 bg-[#0f172a]/55 p-5 xl:w-[340px] xl:border-b-0 xl:border-r">
          <ContentPreviewCard
            blocks={content.blocks}
            smsOfferEnabled={content.smsOfferEnabled}
            smsOfferLabel={content.metadata?.smsExclusiveOffer?.barLabel}
          />
        </div>

        <div className="flex-1 p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ContentStatusBadge status={content.status} />
                {content.smsOfferEnabled && (
                  <span className="inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300">
                    SMS offer enabled
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">{content.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#CAC4CF]">
                {content.description || 'No description was provided for this content yet.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDeleteClick(content)}
              disabled={deleting}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/18 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Delete ${content.title}`}
              title="Delete content"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoPill label="Template" value={content.templateLabel} />
            <InfoPill label="Blocks" value={String(content.blockCount)} />
            <InfoPill label="Structure" value={content.structureType} />
            <InfoPill label="Version" value={content.version} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#3e6ff4]/15 bg-[#111827]/70 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#93c5fd]/75">Created</p>
              <p className="mt-1 text-sm text-white">{formatDateTime(content.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-[#3e6ff4]/15 bg-[#111827]/70 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#93c5fd]/75">Updated</p>
              <p className="mt-1 text-sm text-white">{formatDateTime(content.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#3e6ff4]/35 bg-[#1f2937]/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3e6ff4]/15 text-[#60a5fa]">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-white">No content created yet</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#CAC4CF]">
        Once you publish or save content, it will appear here with a live preview and all saved metadata.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Create content
      </button>
    </div>
  )
}

export default function MyContents() {
  const navigate = useNavigate()
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contentPendingDelete, setContentPendingDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteRequest = (content) => {
    setDeleteError('')
    setContentPendingDelete(content)
  }

  const handleDeleteCancel = () => {
    if (deletingId !== null) {
      return
    }

    setDeleteError('')
    setContentPendingDelete(null)
  }

  const handleDeleteConfirm = async () => {
    const contentId = contentPendingDelete?.id

    if (!contentId) {
      return
    }

    try {
      setDeletingId(contentId)
      setDeleteError('')
      await deleteMyContent(contentId)
      setContents((currentContents) => currentContents.filter((content) => content.id !== contentId))
      setContentPendingDelete(null)
    } catch (deleteRequestError) {
      setDeleteError(
        deleteRequestError?.response?.data?.error
        || deleteRequestError?.response?.data?.detail
        || 'Failed to delete this content.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    let isDisposed = false

    const loadContents = async () => {
      try {
        setLoading(true)
        const response = await getMyContents()

        if (isDisposed) {
          return
        }

        setContents(normalizeContents(response))
        setError('')
      } catch (loadError) {
        if (isDisposed) {
          return
        }

        setContents([])
        setError(loadError?.response?.data?.detail || 'Failed to load your content.')
      } finally {
        if (!isDisposed) {
          setLoading(false)
        }
      }
    }

    loadContents()

    return () => {
      isDisposed = true
    }
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Header />

        <div className="flex-1 m-4 overflow-hidden rounded-2xl border border-[#3e6ff4]/20 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] flex flex-col">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="flex flex-col gap-4 border-b border-[#3e6ff4]/15 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#93c5fd]">Content</p>
                  <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">My Content</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#CAC4CF]">
                    Review every content asset you created, including live block previews, status, timestamps, and saved structure details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/content/builder')}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Create new content
                </button>
              </div>

              <div className="mt-6">
                {loading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#3e6ff4]/20 border-t-[#60a5fa]" />
                      <p className="mt-4 text-sm text-[#CAC4CF]">Loading your content...</p>
                    </div>
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-4 text-red-100">
                    <p className="text-sm font-semibold">Unable to load content</p>
                    <p className="mt-1 text-sm opacity-85">{error}</p>
                  </div>
                )}

                {!loading && !error && contents.length === 0 && (
                  <EmptyState onCreate={() => navigate('/content/builder')} />
                )}

                {!loading && !error && contents.length > 0 && (
                  <div className="space-y-5">
                    {contents.map((content) => (
                      <ContentCard
                        key={content.id ?? content.title}
                        content={content}
                        deleting={deletingId === content.id}
                        onDeleteClick={handleDeleteRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <DeleteConfirmationModal
        content={contentPendingDelete}
        deleting={deletingId !== null}
        error={deleteError}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}