import { useEffect, useRef, useState } from 'react'
import { Loader2, MountainSnow, FileText, Upload, Sparkles } from 'lucide-react'
import { api } from '../api'

export default function AnalyzeForm({ studentName, setStudentName, onAnalyzed }) {
  const [roles, setRoles] = useState([])
  const [staticRoles, setStaticRoles] = useState([])
  const [aiEnabled, setAiEnabled] = useState(false)
  const [role, setRole] = useState('')

  const [inputMode, setInputMode] = useState('text') // 'text' | 'pdf'
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getRoles()
      .then((data) => {
        setRoles(data.roles)
        setStaticRoles(data.static_roles)
        setAiEnabled(data.ai_enabled)
        if (data.roles.length) setRole(data.roles[0])
      })
      .catch(() => setError('Could not reach the backend. Is the Flask server running on port 5000?'))
  }, [])

  const isRoleUsable = (r) => aiEnabled || staticRoles.includes(r)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setError('')
    setResumeFile(file || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!studentName.trim() || !role) {
      setError('Fill in your name and pick a role.')
      return
    }
    if (!isRoleUsable(role)) {
      setError(`"${role}" needs AI mode. Add a Gemini API key, or pick a rule-based role.`)
      return
    }
    if (inputMode === 'text' && !resumeText.trim()) {
      setError('Paste your resume text, or switch to PDF upload.')
      return
    }
    if (inputMode === 'pdf' && !resumeFile) {
      setError('Choose a PDF file to upload, or switch to pasting text.')
      return
    }

    setLoading(true)
    try {
      const result = await api.analyze({
        studentName: studentName.trim(),
        role,
        resumeText: inputMode === 'text' ? resumeText : undefined,
        resumeFile: inputMode === 'pdf' ? resumeFile : undefined,
      })
      onAnalyzed(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        <MountainSnow className="h-3.5 w-3.5" />
        Set up your climb
      </div>
      <h2 className="font-display text-3xl text-ink">Tell us where you're headed</h2>
      <p className="mt-2 font-body text-sm text-ink-soft">
        Everything runs locally except the optional AI scoring step, which
        only sends your resume text to Gemini for that one request.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="mb-2 block font-body text-sm font-medium text-ink">
            Your name
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Vishwa Venkatesh"
            className="w-full rounded-lg border border-contour/60 bg-card px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink-soft/50 focus:border-summit"
          />
          <p className="mt-1 font-mono text-[11px] text-ink-soft">
            Used to track your progress across visits — no login needed.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-body text-sm font-medium text-ink">
            Target role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-contour/60 bg-card px-4 py-2.5 font-body text-sm text-ink focus:border-summit"
          >
            {roles.map((r) => (
              <option key={r} value={r} disabled={!isRoleUsable(r)}>
                {r}
                {!isRoleUsable(r) ? ' (needs AI mode)' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-ink-soft">
            <Sparkles className="h-3 w-3 text-summit" />
            {aiEnabled
              ? 'AI mode is on — all 15 roles are scored dynamically by Gemini.'
              : `AI mode is off — only these roles work: ${staticRoles.join(', ')}.`}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-body text-sm font-medium text-ink">
              Resume
            </label>
            <div className="flex rounded-full border border-contour/60 bg-card p-1">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs transition-colors ${
                  inputMode === 'text' ? 'bg-ink text-paper' : 'text-ink-soft'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Paste text
              </button>
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs transition-colors ${
                  inputMode === 'pdf' ? 'bg-ink text-paper' : 'text-ink-soft'
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload PDF
              </button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={10}
              placeholder="Paste the text of your resume here..."
              className="w-full rounded-lg border border-contour/60 bg-card px-4 py-3 font-body text-sm text-ink placeholder:text-ink-soft/50 focus:border-summit"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-contour/60 bg-card px-4 py-10 text-center transition-colors hover:border-summit"
            >
              <Upload className="mb-2 h-6 w-6 text-ink-soft" />
              <p className="font-body text-sm text-ink">
                {resumeFile ? resumeFile.name : 'Click to choose a PDF resume'}
              </p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">
                Text-based PDFs only — scanned images won't extract cleanly.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-alert/10 px-4 py-2 font-body text-sm text-alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Plotting your route...
            </>
          ) : (
            'Analyze my skill gap'
          )}
        </button>
      </form>
    </section>
  )
}
