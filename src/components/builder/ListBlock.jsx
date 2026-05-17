const MAX_LIST_ITEMS = 15

const normalizeListItem = (item = '') => {
  if (typeof item === 'string') {
    return item
  }

  if (typeof item?.text === 'string') {
    return item.text
  }

  if (typeof item?.label === 'string') {
    return item.label
  }

  return ''
}

const getListItems = (props = {}) => {
  const sourceItems = Array.isArray(props.items) && props.items.length > 0
    ? props.items
    : Array.isArray(props.values)
      ? props.values
      : []

  return sourceItems.slice(0, MAX_LIST_ITEMS).map(normalizeListItem)
}

export const ListBlockPreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'
  const items = getListItems(props).filter((item) => item.trim())

  if (items.length === 0) {
    return (
      <div className={isPublic ? 'w-full bg-white px-5 py-5 text-left' : 'w-full bg-white px-3 py-3 text-left'}>
        <p className={isPublic ? 'text-sm text-gray-400' : 'text-xs text-gray-400'}>Add bullet points to this block.</p>
      </div>
    )
  }

  return (
    <div className={isPublic ? 'w-full bg-white px-5 py-5 text-left' : 'w-full bg-white px-3 py-3 text-left'}>
      <ul className={isPublic ? 'list-disc space-y-3 pl-5 text-[15px] leading-7 text-gray-700' : 'list-disc space-y-1.5 pl-4 text-[11px] leading-5 text-gray-700'}>
        {items.map((item, index) => (
          <li key={`list-item-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export const ListBlockEditor = ({ props = {}, onChange }) => {
  const items = getListItems(props)

  const updateItem = (index, value) => {
    onChange('items', items.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const addItem = () => {
    if (items.length >= MAX_LIST_ITEMS) {
      return
    }

    onChange('items', [...items, ''])
  }

  const removeItem = (index) => {
    onChange('items', items.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-[#CAC4CF]">Bullet Points</label>
          <p className="mt-1 text-[10px] text-[#CAC4CF]/60">Add up to {MAX_LIST_ITEMS} list items.</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= MAX_LIST_ITEMS}
          className="text-xs text-[#60a5fa] transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-[#CAC4CF]/40"
        >
          + Add item
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`list-editor-item-${index}`} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={`Bullet point ${index + 1}`}
              className="w-full rounded border border-[#3e6ff4]/20 bg-[#111827] px-3 py-2 text-sm text-white focus:border-[#3e6ff4]/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="shrink-0 text-xs text-red-400 transition-colors hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}