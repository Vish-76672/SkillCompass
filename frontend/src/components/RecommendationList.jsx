import { Compass } from 'lucide-react'

export default function RecommendationList({ recommendations }) {
  return (
    <div className="rounded-2xl border border-contour/50 bg-card p-6 shadow-card md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        Next best moves
      </p>
      <h3 className="mb-1 font-display text-xl text-ink">
        Your recommended next 4 skills
      </h3>
      <p className="mb-6 font-body text-sm text-ink-soft">
        Ranked by role weight, boosted when a skill builds directly on
        something you already know.
      </p>

      <ol className="space-y-4">
        {recommendations.map((rec, i) => (
          <li
            key={rec.skill}
            className="flex items-start gap-4 rounded-lg border border-contour/40 bg-paper/60 p-4"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-summit/15 font-mono text-sm font-medium text-summit">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm font-semibold text-ink">
                  {rec.skill}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                  priority {rec.priority_score}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-ink-soft">
                <Compass className="h-3 w-3 flex-shrink-0" />
                {rec.reason}
              </p>
            </div>
          </li>
        ))}
        {recommendations.length === 0 && (
          <p className="font-body text-sm text-ink-soft">
            You've matched every skill this role asks for. Nothing left to
            recommend — consider a more senior target role.
          </p>
        )}
      </ol>
    </div>
  )
}
