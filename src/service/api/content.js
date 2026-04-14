import axiosInstance from '../interceptor/axiosInstance'

// POST /api/content/content/
// Saves content as a draft (no status field sent)
// Body: { template, structure }
export async function saveDraft({ template, structure }) {
  const response = await axiosInstance.post('/api/content/v1/', { template, structure })
  return response
}

// Body: { template, structure, status: 'published' }
export async function publishContent({ template, structure }) {
  const response = await axiosInstance.post('/api/content/v1', {
    template,
    structure,
    status: 'published',
  })
  return response
}

// GET /api/content/content/
export async function getContents() {
  const response = await axiosInstance.get('/api/content/v1')
  return response.data
}

// DELETE /api/content/content/{id}/
export async function deleteContent(id) {
  await axiosInstance.delete(`/api/content/v1/${id}`)
}