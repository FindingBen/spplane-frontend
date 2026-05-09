import axiosInstance from '../interceptor/axiosInstance'

function buildContentFormData({ template, structure, status, uploads = {} }) {
  const formData = new FormData()

  formData.append('template', String(template))
  formData.append('structure', JSON.stringify(structure))

  if (status) {
    formData.append('status', status)
  }

  if (uploads.heroImage) {
    formData.append('hero-image', uploads.heroImage)
  }

  if (uploads.heroVideo) {
    formData.append('hero-video', uploads.heroVideo)
  }

  if (uploads.heroVideoPoster) {
    formData.append('hero-video__poster', uploads.heroVideoPoster)
  }

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