import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AnalyzeForm from './components/AnalyzeForm'
import AscentPath from './components/AscentPath'
import ScoreGauge from './components/ScoreGauge'
import RecommendationList from './components/RecommendationList'
import HistoryPanel from './components/HistoryPanel'
import { Sparkles, Calculator } from 'lucide-react'

export default function App() {
  const [view, setView] = useState('landing')
  const [studentName, setStudentName] = useState(
    () => localStorage.getItem('sc_student_name') || ''
  )
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (studentName) localStorage.setItem('sc_student_name', studentName)
  }, [studentName])

  const handleAnalyzed = (data) => {
    setResult(data)
    setView('results')
  }

  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <Navbar view={view} setView={setView} hasResult={!!result} />

      {view === 'landing' && <Hero onStart={() => setView('analyze')} />}

      {view === 'analyze' && (
        <AnalyzeForm
          studentName={studentName}
          setStudentName={setStudentName}
          onAnalyzed={handleAnalyzed}
        />
      )}

      {view === 'results' && result && (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                Analysis complete
              </p>
              <h2 className="font-display text-3xl text-ink">
                Route to {result.role}
              </h2>
              <p className="mt-2 font-body text-sm text-ink-soft">
                {result.matched_count} of {result.total_skills} required
                skills reached so far.
              </p>
              <span
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide ${
                  result.mode === 'ai'
                    ? 'bg-summit/15 text-summit'
                    : 'bg-trail/15 text-trail-dark'
                }`}
              >
                {result.mode === 'ai' ? (
                  <>
                    <Sparkles className="h-3 w-3" /> AI-powered analysis
                  </>
                ) : (
                  <>
                    <Calculator className="h-3 w-3" /> Rule-based analysis
                  </>
                )}
              </span>
            </div>
            <ScoreGauge score={result.score} />
          </div>

          {result.warning && (
            <p className="mb-8 rounded-lg bg-summit/10 px-4 py-2 font-body text-sm text-summit">
              {result.warning}
            </p>
          )}

          <div className="space-y-8">
            <RecommendationList recommendations={result.recommendations} />
            <AscentPath
              matched={result.matched}
              missing={result.missing}
              role={result.role}
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => setView('analyze')}
              className="rounded-full border border-contour/60 px-5 py-2.5 font-body text-sm text-ink hover:bg-ink/5"
            >
              Run another analysis
            </button>
            <button
              onClick={() => setView('history')}
              className="rounded-full bg-ink px-5 py-2.5 font-body text-sm text-paper"
            >
              View my progress over time
            </button>
          </div>
        </section>
      )}

      {view === 'history' && <HistoryPanel studentName={studentName} />}

      <footer className="border-t border-contour/40 py-8">
        <p className="mx-auto max-w-6xl px-6 font-mono text-[11px] text-ink-soft">
          Skill Compass — a skill-gap analysis platform for students. Built as
          a mini project.
        </p>
      </footer>
    </div>
  )
}
