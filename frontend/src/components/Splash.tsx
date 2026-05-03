import { NexusLogo, ArrowRight } from './Icons'

interface SplashProps {
  onStart: () => void
  loading?: boolean
}

export function Splash({ onStart, loading }: SplashProps) {
  return (
    <div className="splash-wrap">
      {/* Corner labels */}
      <div className="splash-corner-tl stagger-1">
        Nexus Platform · Series 001
      </div>
      <div className="splash-corner-br stagger-1">
        AI · LangGraph · Groq
      </div>
      <div className="splash-vertical-label">
        Business Intelligence Platform
      </div>

      {/* Main content — vertically centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>

        {/* Logo mark */}
        <div className="stagger-1" style={{ marginBottom: 32 }}>
          <NexusLogo size={52} />
        </div>

        {/* Hero type */}
        <div className="stagger-2" style={{ marginBottom: 4 }}>
          <div className="display" style={{ color: 'var(--carbon)' }}>NEXUS</div>
        </div>

        <div className="stagger-3" style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--f-serif)',
            fontSize: 'clamp(15px, 4vw, 20px)',
            color: 'var(--carbon-3)',
            lineHeight: 1.35,
            maxWidth: 260,
          }}>
            Бизнес-идеи, точно подобранные под ваш профиль
          </div>
        </div>

        {/* Divider with label */}
        <div className="stagger-3" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--carbon)', opacity: 0.15 }} />
          <div className="eyebrow">Как это работает</div>
          <div style={{ flex: 1, height: 1, background: 'var(--carbon)', opacity: 0.15 }} />
        </div>

        {/* Steps */}
        <div className="stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {[
            ['01', 'Профиль', 'Капитал, опыт, цели — 2 минуты'],
            ['02', 'AI-анализ', '8 идей × 3 дискриминатора параллельно'],
            ['03', 'Финмодель', 'Сценарии, CAC/LTV, окупаемость'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 28, height: 28,
                background: 'var(--carbon)',
                color: 'var(--parch)',
                fontFamily: 'var(--f-display)',
                fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{num}</div>
              <div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</div>
                <div style={{ fontSize: 11, color: 'var(--carbon-4)', marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="stagger-5">
          <button className="btn btn-fill" onClick={onStart} disabled={loading}>
            <span>{loading ? 'Подождите...' : 'Начать'}</span>
            {!loading && <ArrowRight size={13} />}
          </button>
        </div>
      </div>
    </div>
  )
}
