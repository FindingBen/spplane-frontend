// DescriptionBlock — Section heading + body text

export const DescriptionPreview = ({ props = {} }) => (
  <div className="w-full px-3 py-2 bg-white">
    {props.heading && (
      <h3 className="text-xs font-bold text-black mb-1">{props.heading}</h3>
    )}
    <p className="text-xs text-gray-600 leading-relaxed">{props.content}</p>
  </div>
)

export const DescriptionEditor = ({ props = {}, onChange }) => (
  <>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Section Heading</label>
      <input
        type="text"
        value={props.heading || ''}
        onChange={(e) => onChange('heading', e.target.value)}
        placeholder="Description"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-[#CAC4CF] mb-2">Content</label>
      <textarea
        value={props.content || ''}
        onChange={(e) => onChange('content', e.target.value)}
        rows="4"
        className="w-full px-3 py-2 bg-[#111827] border border-[#3e6ff4]/20 rounded text-white text-sm focus:outline-none focus:border-[#3e6ff4]/60 resize-none"
      />
    </div>
  </>
)
