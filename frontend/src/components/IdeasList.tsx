import type { IdeaCard } from '../types'
import { IdeaGlyph, ArrowRight } from './Icons'
import { NexusLogo } from './Icons'

interface IdeasProps {
  ideas: IdeaCard[]
  onSelect: (idea: IdeaCard) => void
}

function Pips({ difficulty }: { difficulty?: string }) {
  const filled = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2
  return (
    <div className="pips">
      {[1,2,3].map(i => <div key={i} className={`pip ${i <= filled ? 'filled' : ''}`} />)}
    </div>
  )
}

function TrendBadge({ trend }: { trend?: string }) {
  if (trend === 'growing')  return <span className="tag tag-good trend-up">↑ Растёт</span>
  if (trend === 'declining') return <span className="tag tag-bad trend-down">↓ Падает</span>
  return <span className="tag tag-neutral">→ Стабильно</span>
}

function ScoreBar({ score }: { score: number }) {
  const cls = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="score-num">{score}</div>
      <div className="score-track">
        <div className={`score-bar ${cls}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export function IdeasList({ ideas, onSelect }: IdeasProps) {
  return (
    <div className="screen">

      <div className="top-bar">
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Nexus · Результат</div>
          <div className="display-md">{ideas.length} идей</div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 14, color: 'var(--carbon-4)', marginTop: 2 }}>
            прошли через 3 AI-фильтра
          </div>
        </div>
        <NexusLogo size={32} />
      </div>

      <div className="rule" style={{ marginBottom: 16 }} />

      <div className="scroll-area">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ideas.map((idea, i) => (
            <div
              key={idea.id}
              className="card"
              onClick={() => onSelect(idea)}
              style={{ animationDelay: `${i * 0.07}s`, animation: 'slideUp 0.5s var(--ease) both' }}
            >
              <div className="card-nr">nr.{String(i + 1).padStart(3, '0')}</div>

              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: 44, marginBottom: 10 }}>
                <div className="rank-badge">{i + 1}</div>
                <div>
                  <div style={{
                    fontFamily: 'var(--f-serif)',
                    fontSize: 17,
                    lineHeight: 1.2,
                    marginBottom: 3,
                  }}>
                    {idea.title}
                  </div>
                  {idea.tagline && (
                    <div className="eyebrow" style={{ color: 'var(--carbon-4)' }}>{idea.tagline}</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: 'var(--carbon-3)', lineHeight: 1.65, marginBottom: 12 }}>
                {(idea.description || '').slice(0, 110)}{(idea.description || '').length > 110 ? '…' : ''}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ScoreBar score={idea.total_score || 0} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pips difficulty={idea.difficulty} />
                  <TrendBadge trend={idea.trend} />
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
