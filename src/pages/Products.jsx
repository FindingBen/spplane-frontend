import { useEffect, useState } from 'react'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import { getShopifyProducts, importShopifyProducts } from '../service/api/products'

const PRODUCT_FETCH_LIMIT = 50

const STATUS_BADGE = {
  active: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  draft: 'border border-amber-500/25 bg-amber-500/10 text-amber-200',
  archived: 'border border-slate-500/25 bg-slate-500/10 text-slate-300',
  unknown: 'border border-[#CAC4CF]/20 bg-[#CAC4CF]/10 text-[#CAC4CF]',
}

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const getNumber = (...values) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsedValue = Number(value)
      if (Number.isFinite(parsedValue)) {
        return parsedValue
      }
    }
  }

  return null
}

const toNodes = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (Array.isArray(value?.nodes)) {
    return value.nodes.filter(Boolean)
  }

  if (Array.isArray(value?.edges)) {
    return value.edges.map((edge) => edge?.node ?? edge).filter(Boolean)
  }

  return []
}

const extractProducts = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

  if (Array.isArray(payload?.products)) {
    return payload.products
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.edges)) {
    return payload.edges.map((edge) => edge?.node ?? edge).filter(Boolean)
  }

  return []
}

const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatPrice = (value, currencyCode = 'USD') => {
  if (value == null || value === '') {
    return '—'
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)
    if (!Number.isFinite(parsedValue)) {
      return value
    }

    value = parsedValue
  }

  if (!Number.isFinite(value)) {
    return '—'
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currencyCode}`
  }
}

const normalizeProduct = (product, index) => {
  const variants = toNodes(product?.variants)
  const images = toNodes(product?.images)
  const priceRange = product?.priceRange || product?.price_range || {}
  const minVariantPrice = priceRange?.minVariantPrice || priceRange?.min_variant_price || {}
  const variantInventoryValues = variants
    .map((variant) => getNumber(variant?.inventoryQuantity, variant?.inventory_quantity))
    .filter((value) => value != null)

  const title = pickFirstString(product?.title, product?.name, product?.product_title) || `Untitled Product ${index + 1}`
  const handle = pickFirstString(product?.handle, product?.slug)
  const vendor = pickFirstString(product?.vendor, product?.brand) || 'Unknown vendor'
  const productType = pickFirstString(product?.productType, product?.product_type, product?.category) || 'General'
  const status = String(product?.status || product?.published_status || 'unknown').toLowerCase()
  const priceValue = minVariantPrice?.amount ?? product?.price ?? product?.min_price ?? variants[0]?.price
  const currencyCode = pickFirstString(
    minVariantPrice?.currencyCode,
    minVariantPrice?.currency_code,
    product?.currency,
    variants[0]?.currency,
  ) || 'USD'
  const inventoryCount = getNumber(
    product?.totalInventory,
    product?.total_inventory,
    product?.inventory_quantity,
    product?.inventory,
  ) ?? (variantInventoryValues.length > 0
    ? variantInventoryValues.reduce((total, value) => total + value, 0)
    : null)

  return {
    id: product?.id || product?.admin_graphql_api_id || product?.shopify_id || handle || `product-${index}`,
    title,
    handle,
    vendor,
    productType,
    status,
    imageUrl: pickFirstString(
      product?.image?.src,
      product?.image?.url,
      product?.image?.originalSrc,
      product?.featuredImage?.url,
      product?.featuredImage?.src,
      product?.featured_image?.src,
      product?.featured_image?.url,
      images[0]?.src,
      images[0]?.url,
      images[0]?.originalSrc,
    ),
    price: formatPrice(priceValue, currencyCode),
    inventoryCount,
    variantCount: getNumber(product?.variantsCount, product?.variants_count, product?.total_variants) ?? variants.length,
    updatedAt: formatDate(product?.updatedAt || product?.updated_at || product?.published_at || product?.created_at),
  }
}

const buildImportNotice = (payload, tone = 'success') => {
  if (tone === 'error') {
    return {
      tone,
      title: 'Shopify import failed',
      description: payload?.error || payload?.detail || payload?.message || 'We could not import products from Shopify.',
    }
  }

  const importedCount = getNumber(
    payload?.imported_count,
    payload?.imported,
    payload?.count,
    payload?.total_imported,
    payload?.products_imported,
  )

  return {
    tone,
    title: 'Shopify import finished',
    description: importedCount != null
      ? `Imported ${importedCount} product${importedCount === 1 ? '' : 's'} from Shopify.`
      : 'Products were imported from Shopify successfully.',
  }
}

function NoticeBanner({ notice, onDismiss }) {
  if (!notice) {
    return null
  }

  const toneStyles = notice.tone === 'error'
    ? 'border-red-500/35 bg-red-500/10 text-red-100'
    : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-50'

  return (
    <div className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 ${toneStyles}`}>
      <div>
        <p className="text-sm font-semibold">{notice.title}</p>
        <p className="mt-1 text-sm opacity-85">{notice.description}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg border border-white/10 bg-black/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-black/20 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  )
}

function ProductCard({ product }) {
  const statusBadge = STATUS_BADGE[product.status] || STATUS_BADGE.unknown
  const inventoryLabel = product.inventoryCount == null ? 'Inventory unavailable' : `${product.inventoryCount} in stock`

  return (
    <article className="overflow-hidden rounded-2xl border border-[#3e6ff4]/20 bg-[#1f2937]/70 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="relative h-48 bg-[#111827]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_rgba(17,24,39,0.96)_55%)] text-[#60a5fa]">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h18M7 3v4m10-4v4m-9 8h8m-8 4h5M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusBadge}`}>
            {product.status}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white line-clamp-2">{product.title}</h2>
              <p className="mt-1 text-sm text-[#CAC4CF]">{product.vendor}</p>
            </div>
            <p className="text-sm font-semibold text-[#60a5fa]">{product.price}</p>
          </div>
          {product.handle && (
            <p className="mt-2 truncate text-xs text-[#CAC4CF]/65">/{product.handle}</p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#CAC4CF]/55">Type</dt>
            <dd className="mt-1 text-white">{product.productType}</dd>
          </div>
          <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#CAC4CF]/55">Variants</dt>
            <dd className="mt-1 text-white">{product.variantCount || 0}</dd>
          </div>
          <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#CAC4CF]/55">Inventory</dt>
            <dd className="mt-1 text-white">{inventoryLabel}</dd>
          </div>
          <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#CAC4CF]/55">Updated</dt>
            <dd className="mt-1 text-white">{product.updatedAt}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importNotice, setImportNotice] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let isDisposed = false
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const payload = await getShopifyProducts({
          search: search.trim(),
          first: PRODUCT_FETCH_LIMIT,
        })

        if (isDisposed) {
          return
        }

        setProducts(extractProducts(payload).map(normalizeProduct))
      } catch (err) {
        if (isDisposed) {
          return
        }

        setProducts([])
        setError(err?.response?.data?.error || err?.response?.data?.detail || 'Failed to load products. Please try again.')
      } finally {
        if (!isDisposed) {
          setLoading(false)
        }
      }
    }, 250)

    return () => {
      isDisposed = true
      window.clearTimeout(timeoutId)
    }
  }, [search, refreshTick])

  const handleImport = async () => {
    setImporting(true)
    setImportNotice(null)

    try {
      const payload = await importShopifyProducts()
      setImportNotice(buildImportNotice(payload))
      setRefreshTick((value) => value + 1)
    } catch (err) {
      setImportNotice(buildImportNotice(err?.response?.data, 'error'))
    } finally {
      setImporting(false)
    }
  }

  const totalProducts = products.length
  const activeProducts = products.filter((product) => product.status === 'active').length
  const vendorCount = new Set(products.map((product) => product.vendor).filter((vendor) => vendor && vendor !== 'Unknown vendor')).size

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827]">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Header />

        <div className="flex-1 m-4 bg-gradient-to-br from-[#111827] via-[#1D1A22] to-[#111827] rounded-2xl border border-[#3e6ff4]/20 overflow-hidden flex flex-col h-full">
          <main className="flex-1 flex flex-col p-4 md:p-8 2xl:p-5 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-2xl md:text-4xl 2xl:text-3xl font-bold text-white mb-1">
                    <span className="bg-gradient-to-r from-[#3e6ff4] to-[#60a5fa] bg-clip-text text-transparent">Products</span>
                  </h1>
                  <p className="text-sm md:text-base text-[#CAC4CF]">
                    Import Shopify products and browse the latest 50 synced items.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 px-4 py-2.5 text-sm font-semibold text-[#60a5fa] transition-colors hover:bg-[#3e6ff4]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {importing ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  {importing ? 'Importing…' : 'Import All Shopify Products'}
                </button>
              </div>

              <NoticeBanner notice={importNotice} onDismiss={() => setImportNotice(null)} />

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#3e6ff4]/20 bg-[#1f2937] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#CAC4CF]/60">Loaded Products</p>
                  <p className="mt-2 text-3xl font-bold text-white">{totalProducts.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#CAC4CF]">Showing up to {PRODUCT_FETCH_LIMIT} Shopify products.</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-[#1f2937] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/70">Active Products</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-300">{activeProducts.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#CAC4CF]">Products currently marked active in Shopify.</p>
                </div>
                <div className="rounded-2xl border border-[#60a5fa]/20 bg-[#1f2937] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#60a5fa]/75">Vendors</p>
                  <p className="mt-2 text-3xl font-bold text-[#60a5fa]">{vendorCount.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#CAC4CF]">Distinct vendors in the current result set.</p>
                </div>
              </div>

              <div className="relative mb-2">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CAC4CF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Shopify products by title, handle, or vendor…"
                  className="w-full rounded-xl border border-[#3e6ff4]/20 bg-[#1f2937] py-2.5 pl-9 pr-4 text-sm text-white placeholder-[#CAC4CF]/40 focus:outline-none focus:border-[#3e6ff4]"
                />
              </div>

              <p className="mb-5 text-xs text-[#CAC4CF]/70">
                Search runs against `/api/shopify/products/` and returns the first {PRODUCT_FETCH_LIMIT} matches.
              </p>

              {error && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setRefreshTick((value) => value + 1)}
                    className="shrink-0 text-xs font-medium underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-10 w-10 rounded-full border-4 border-[#3e6ff4]/30 border-t-[#3e6ff4] animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-[#3e6ff4]/20 bg-[#1f2937]/60 px-6 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3e6ff4]/10 text-[#60a5fa]">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-white">
                    {search ? 'No products matched your search' : 'No Shopify products loaded yet'}
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#CAC4CF]">
                    {search
                      ? 'Try a broader search term or clear the filter to see recently synced products.'
                      : 'Run a Shopify import to pull your catalog into this workspace and start using those products in the builder.'}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#CAC4CF] transition-colors hover:bg-white/10 hover:text-white"
                      >
                        Clear Search
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={importing}
                      className="rounded-xl border border-[#3e6ff4]/40 bg-[#3e6ff4]/10 px-4 py-2 text-sm font-semibold text-[#60a5fa] transition-colors hover:bg-[#3e6ff4]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {importing ? 'Importing…' : 'Import All Shopify Products'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
