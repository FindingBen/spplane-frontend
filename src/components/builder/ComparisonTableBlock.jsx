// ComparisonTableBlock — Feature comparison table (us vs. competitor)

export const ComparisonTablePreview = ({ props = {}, variant = 'builder' }) => {
  const isPublic = variant === 'public'

  return (
    <div className={isPublic ? 'w-full px-5 py-5 bg-white' : 'w-full px-3 py-3 bg-white'}>
      {props.title && <h3 className={isPublic ? 'text-base font-bold text-black text-left mb-3' : 'text-xs font-bold text-black mb-2'}>{props.title}</h3>}
      <div className={isPublic ? 'w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm' : 'w-full overflow-hidden rounded border border-gray-200'}>
        <table className={isPublic ? 'w-full text-xs' : 'w-full text-[9px]'}>
          <thead>
            <tr className="bg-gray-100">
              <th className={isPublic ? 'text-left px-3 py-2.5 text-gray-600 font-semibold w-1/3' : 'text-left px-2 py-1 text-gray-600 font-semibold w-1/3'}>Feature</th>
              <th className={isPublic ? 'text-center px-3 py-2.5 text-green-700 font-semibold w-1/3' : 'text-center px-2 py-1 text-green-700 font-semibold w-1/3'}>Us</th>
              <th className={isPublic ? 'text-center px-3 py-2.5 text-gray-500 font-semibold w-1/3' : 'text-center px-2 py-1 text-gray-500 font-semibold w-1/3'}>Them</th>
            </tr>
          </thead>
          <tbody>
            {(props.comparisons || []).map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={isPublic ? 'px-3 py-3 text-black font-medium text-left align-top' : 'px-2 py-1 text-black font-medium'}>{row.feature}</td>
                <td className={isPublic ? 'px-3 py-3 text-green-700 text-center align-top' : 'px-2 py-1 text-green-700 text-center'}>{row.us}</td>
                <td className={isPublic ? 'px-3 py-3 text-gray-500 text-center align-top' : 'px-2 py-1 text-gray-500 text-center'}>{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const ComparisonTableEditor = ({ props = {}, onChange }) => {
  const comparisons = props.comparisons || []

  const updateRow = (idx, field, value) => {
    onChange('comparisons', comparisons.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  const addRow = () => {
    onChange('comparisons', [...comparisons, { feature: '', us: '', competitor: '' }])
  }

  const removeRow = (idx) => {
    onChange('comparisons', comparisons.filter((_, i) => i !== idx))
  }

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Title</label>
        <input type="text" value={props.title || ''} onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none focus:border-[#3e6ff4]/60" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#CAC4CF]">Rows</label>
          <button onClick={addRow} className="text-xs text-[#3e6ff4] hover:text-[#60a5fa]">+ Add Row</button>
        </div>
        <div className="space-y-2">
          {comparisons.map((row, idx) => (
            <div key={idx} className="bg-[#111827] border border-[#3e6ff4]/20 rounded p-2 space-y-1.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#CAC4CF] font-semibold">Row {idx + 1}</span>
                <button onClick={() => removeRow(idx)} className="text-red-400 text-xs hover:text-red-300">✕</button>
              </div>
              {[
                { key: 'feature', placeholder: 'Feature name' },
                { key: 'us', placeholder: 'Our value' },
                { key: 'competitor', placeholder: 'Competitor value' },
              ].map(({ key, placeholder }) => (
                <input key={key} type="text" placeholder={placeholder} value={row[key] || ''}
                  onChange={(e) => updateRow(idx, key, e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#1f2937] border border-[#3e6ff4]/20 rounded text-white text-xs focus:outline-none" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
