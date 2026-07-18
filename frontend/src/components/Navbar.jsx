import { Compass } from 'lucide-react'

export default function Navbar({ view, setView, hasResult }) {
  const items = [
    { key: 'landing', label: 'Home' },
    { key: 'analyze', label: 'Analyze' },
    { key: 'results', label: 'Results', disabled: !hasResult },
    { key: 'history', label: 'History' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-contour/40 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink"
        >
          <Compass className="h-5 w-5 text-summit" strokeWidth={1.75} />
          Skill Compass
        </button>

        <nav className="flex items-center gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              disabled={item.disabled}
              onClick={() => setView(item.key)}
              className={`rounded-full px-4 py-1.5 font-body text-sm transition-colors ${
                view === item.key
                  ? 'bg-ink text-paper'
                  : item.disabled
                  ? 'cursor-not-allowed text-ink-soft/40'
                  : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
