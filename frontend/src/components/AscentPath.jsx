import { Check, Circle } from 'lucide-react'

export default function AscentPath({ matched, missing, role }) {
  const combined = [
    ...matched.map((m) => ({ ...m, status: 'reached' })),
    ...missing.map((m) => ({ ...m, status: 'ahead' })),
  ].sort((a, b) => a.weight - b.weight)

  return (
    <div className="rounded-2xl border border-contour/50 bg-card p-6 shadow-card md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            The route
          </p>
          <h3 className="font-display text-xl text-ink">
            Skills between base camp and {role}
          </h3>
        </div>
      </div>

      <div className="flex flex-col-reverse">
        {combined.map((item, i) => {
          const isLast = i === 0
          const isReached = item.status === 'reached'
          const tierLabel = item.weight >= 4 ? 'Core requirement' : 'Supporting skill'

          return (
            <div key={item.skill} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span className="absolute left-[13px] top-6 h-full w-px border-l border-dashed border-contour" />
              )}

              <span
                className={`z-10 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  isReached
                    ? 'border-trail bg-trail text-paper'
                    : 'border-summit bg-card text-summit'
                }`}
              >
                {isReached ? <Check className="h-4 w-4" /> : <Circle className="h-2 w-2 fill-current" />}
              </span>

              <div className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-lg border border-contour/40 bg-paper/60 px-4 py-3">
                <div>
                  <p className="font-body text-sm font-medium text-ink">{item.skill}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                    {tierLabel} &middot; weight {item.weight}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide ${
                    isReached
                      ? 'bg-trail/10 text-trail-dark'
                      : 'bg-summit/10 text-summit'
                  }`}
                >
                  {isReached ? 'Reached' : 'Ahead on the trail'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
