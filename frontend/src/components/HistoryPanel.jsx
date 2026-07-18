import { useEffect, useState } from 'react'
import { History, TrendingUp } from 'lucide-react'
import { api } from '../api'

function Sparkline({ points }) {
  if (points.length < 2) {
    return (
      <p className="font-body text-sm text-ink-soft">
        Analyze at least twice to see a trend line here.
      </p>
    )
  }

  const width = 560
  const height = 140
  const padding = 20
  const scores = points.map((p) => p.score)
  const max = Math.max(100, ...scores)
  const min = Math.min(0, ...scores)

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2)
    const y =
      height - padding - ((p.score - min) / (max - min || 1)) * (height - padding * 2)
    return [x, y]
  })

  const path = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <path d={path} fill="none" stroke="#4F6B4C" strokeWidth="2.5" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#B98B2E" />
      ))}
    </svg>
  )
}

export default function HistoryPanel({ studentName }) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentName) {
      setLoading(false)
      return
    }
    api
      .getHistory(studentName)
      .then((data) => setAttempts(data.attempts))
      .catch(() => setError('Could not load history.'))
      .finally(() => setLoading(false))
  }, [studentName])

  if (!studentName) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-body text-sm text-ink-soft">
          Run an analysis first — history is tracked per name you enter.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        <History className="h-3.5 w-3.5" />
        Monitoring your climb
      </div>
      <h2 className="font-display text-3xl text-ink">{studentName}'s progress</h2>
      <p className="mt-2 font-body text-sm text-ink-soft">
        Every analysis is logged, so you can see whether your route-match
        score is trending up over time.
      </p>

      {loading && <p className="mt-8 font-body text-sm text-ink-soft">Loading...</p>}
      {error && <p className="mt-8 font-body text-sm text-alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-8 rounded-2xl border border-contour/50 bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2 font-body text-sm font-medium text-ink">
              <TrendingUp className="h-4 w-4 text-trail" />
              Score trend
            </div>
            <Sparkline points={attempts} />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-contour/50 bg-card shadow-card">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-contour/40 text-ink-soft">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Target role</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-contour/20 last:border-none">
                    <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                      {new Date(a.created_at).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-ink">{a.role}</td>
                    <td className="px-5 py-3 font-mono text-ink">{a.score}%</td>
                  </tr>
                ))}
                {attempts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-ink-soft">
                      No attempts yet for this name.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
