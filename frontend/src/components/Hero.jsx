import { ArrowUpRight, MapPin, Compass, Flag } from 'lucide-react'

function TopoMountain() {
  return (
    <svg
      viewBox="0 0 640 360"
      className="h-full w-full"
      role="img"
      aria-label="Topographic illustration of a mountain ascent from base camp to summit"
    >
      {/* Contour rings — layered elevation lines, not decorative filler */}
      {[
        'M 40 320 Q 320 260 600 320',
        'M 70 290 Q 320 230 570 290',
        'M 110 258 Q 320 205 530 258',
        'M 150 224 Q 320 178 490 224',
        'M 195 190 Q 320 150 445 190',
        'M 240 155 Q 320 122 400 155',
        'M 280 120 Q 320 100 360 120',
      ].map((d, i) => (
        <path key={i} d={d} className="contour-line" opacity={0.55} />
      ))}

      {/* Summit peak */}
      <path
        d="M 320 88 L 260 190 L 380 190 Z"
        fill="#4F6B4C"
        opacity="0.15"
      />
      <path d="M 320 88 L 260 190 L 380 190 Z" fill="none" stroke="#3A4F38" strokeWidth="1.5" />

      {/* Dotted ascent path */}
      <path
        d="M 90 320 C 160 300, 190 260, 230 250 S 300 210, 300 190 S 320 130, 320 92"
        fill="none"
        stroke="#B98B2E"
        strokeWidth="2.5"
        strokeDasharray="1 8"
        strokeLinecap="round"
      />

      {/* Base camp marker */}
      <circle cx="90" cy="320" r="7" fill="#EEF0E8" stroke="#4F6B4C" strokeWidth="2.5" />
      {/* Camp markers */}
      <circle cx="230" cy="250" r="6" fill="#4F6B4C" />
      <circle cx="300" cy="190" r="6" fill="#4F6B4C" />
      {/* Summit marker */}
      <circle cx="320" cy="92" r="7" fill="#B98B2E" stroke="#22302B" strokeWidth="1.5" />
    </svg>
  )
}

export default function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            <Compass className="h-3.5 w-3.5" strokeWidth={2} />
            Skill-gap analysis for students
          </p>
          <h1 className="font-display text-4xl leading-[1.1] text-ink md:text-5xl">
            You know the summit.
            <br />
            <span className="italic text-trail">We chart the climb.</span>
          </h1>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-ink-soft">
            Paste your resume, pick the role you're aiming for, and Skill Compass
            plots exactly which skills stand between base camp and the summit —
            ranked by what actually moves the needle next.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={onStart}
              className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Start your climb
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <span className="font-mono text-xs text-ink-soft">
              Takes ~2 minutes, no sign-up
            </span>
          </div>
        </div>

        <div className="relative aspect-[16/10] rounded-2xl border border-contour/50 bg-card shadow-card">
          <TopoMountain />
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 font-mono text-[11px] text-ink-soft">
            <MapPin className="h-3 w-3" /> Base camp — your current skills
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-1.5 font-mono text-[11px] text-summit">
            <Flag className="h-3 w-3" /> Summit — target role
          </div>
        </div>
      </div>

      {/* How it works — a genuine sequence, so numbering earns its keep */}
      <div className="border-y border-contour/40 bg-card/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-14 md:grid-cols-3">
          {[
            {
              n: '01',
              title: 'Base camp',
              body: 'Paste your resume text and tell us the role you\u2019re climbing toward.',
            },
            {
              n: '02',
              title: 'The ascent',
              body: 'We score every required skill against your resume and weigh what\u2019s missing.',
            },
            {
              n: '03',
              title: 'Summit route',
              body: 'Get a ranked list of the next skills to learn — and revisit later to track progress.',
            },
          ].map((step) => (
            <div key={step.n}>
              <span className="font-mono text-xs text-summit">{step.n}</span>
              <h3 className="mt-2 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
