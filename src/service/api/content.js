import axiosInstance from '../interceptor/axiosInstance'

function buildContentFormData({ template, structure, status, uploads = {} }) {
  const formData = new FormData()

  formData.append('template', String(template))
  formData.append('structure', JSON.stringify(structure))

  if (status) {
    formData.append('status', status)
  }

  Object.entries(uploads).forEach(([fieldName, file]) => {
    if (file) {
      formData.append(fieldName, file)
    }
  })

  return formData
}

// POST /api/content/content/
// Saves content as a draft (no status field sent)
// Body: multipart form data with template, structure and optional uploads
export async function saveDraft({ template, structure, uploads }) {
  const response = await axiosInstance.post(
    '/api/content/v1/',
    buildContentFormData({ template, structure, uploads })
  )
  return response
}

// Body: multipart form data with template, structure, status and optional uploads
export async function publishContent({ template, structure, uploads }) {
  const response = await axiosInstance.post(
    '/api/content/v1/',
    buildContentFormData({ template, structure, status: 'published', uploads })
  )
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

export async function generateContentProduct({ product_id, persist = true }) {
  const response = await axiosInstance.post('/api/content/generate/v1', {
    product_id,
    persist,
  })
  return response.data
}