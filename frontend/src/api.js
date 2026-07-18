const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export const api = {
  getRoles: () =>
    request('/api/roles', {
      headers: { 'Content-Type': 'application/json' },
    }),

  // Always sends multipart/form-data so the same endpoint handles both
  // pasted text and an uploaded PDF file. Don't set Content-Type manually
  // here -- the browser needs to add its own multipart boundary.
  analyze: ({ studentName, role, resumeText, resumeFile }) => {
    const formData = new FormData()
    formData.append('student_name', studentName)
    formData.append('role', role)
    if (resumeFile) {
      formData.append('resume_file', resumeFile)
    } else {
      formData.append('resume_text', resumeText || '')
    }
    return request('/api/analyze', { method: 'POST', body: formData })
  },

  getHistory: (studentName) =>
    request(`/api/history/${encodeURIComponent(studentName)}`, {
      headers: { 'Content-Type': 'application/json' },
    }),
}
