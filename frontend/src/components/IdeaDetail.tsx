import type { IdeaCard } from '../types'
import { IdeaGlyph, ArrowRight, ChevronLeft } from './Icons'

interface IdeaDetailProps {
  idea: IdeaCard
  onBack: () => void
  onBuildModel: () => void
}

const FLAG_LABELS: Record<string, [string, 'warn' | 'bad']> = {
  capital_tight:      ['Капитал на пределе', 'warn'],
  capital_insufficient: ['Недостаточно капитала', 'bad'],
  high_competition:   ['Высокая конкуренция', 'warn'],
  license_required:   ['Требуется лицензия', 'warn'],
  license_medical:    ['Мед. лицензия', 'bad'],
  license_education:  ['Образ. лицензия', 'warn'],
  license_alcohol:    ['Лицензия на алкоголь', 'warn'],
  market_saturated:   ['Насыщенный рынок', 'bad'],
  market_declining:   ['Падающий рынок', 'bad'],
  payback_too_long:   ['Долгая окупаемость', 'warn'],
  team_insufficient:  ['Нехватка команды', 'warn'],
  experience_gap:     ['Нет нужного опыта', 'warn'],
  seasonal_cashflow:  ['Сезонный денежный поток', 'warn'],
  high_fixed_costs:   ['Высокие фикс. расходы', 'warn'],
}

function VerdictCell({ label, verdict }: { label: string; verdict: string }) {
  const icon = verdict === 'pass' ? '✓' : verdict === 'warn' ? '!' : '✕'
  const cls  = verdict === 'pass' ? 'verdict-pass' : verdict === 'warn' ? 'verdict-warn' : 'verdict-fail'
  return (
    <div className="verdict-cell">
      <div className={`verdict-icon ${cls}`}>{icon}</div>
      <div className="eyebrow">{label}</div>
    </div>
  )
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className="eyebrow">{title}</div>
        <div style={{ flex: 1, height: 1, background: 'rgba(15,15,15,0.1)' }} />
      </div>
      {children}
    </div>
  )
}

export function IdeaDetail({ idea, onBack, onBuildModel }: IdeaDetailProps) {
  const flagEntries = (idea.all_flags || []).map(f => [f, FLAG_LABELS[f] || [f, 'warn']] as const)

  return (
    <div className="screen">

      {/* Back */}
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ChevronLeft size={13} />
        <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Все идеи</span>
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 6 }}>
        <IdeaGlyph index={0} size={32} />
        <div>
          <div className="display-sm">{idea.title}</div>
          {idea.tagline && (
            <div className="eyebrow" style={{ marginTop: 4 }}>{idea.tagline}</div>
          )}
        </div>
      </div>

      {/* Score + verdicts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 16px' }}>
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: 36,
          lineHeight: 1,
          color: 'var(--carbon)',
        }}>{idea.total_score || 0}</div>
        <div style={{ fontSize: 10, color: 'var(--carbon-4)', lineHeight: 1.4 }}>
          <div>из 100</div>
          <div className="eyebrow">итоговый скор</div>
        </div>
      </div>

      <div className="verdict-row" style={{ marginBottom: 4 }}>
        <VerdictCell label="Финансы"   verdict={idea.financial_verdict || 'warn'} />
        <VerdictCell label="Рынок"     verdict={idea.market_verdict || 'warn'} />
        <VerdictCell label="Операции"  verdict={idea.ops_verdict || 'warn'} />
      </div>

      <div className="rule" style={{ marginBottom: 4 }} />

      <div className="scroll-area">

        <InfoBlock title="Суть бизнеса">
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--carbon-2)' }}>{idea.description}</p>
        </InfoBlock>

        <InfoBlock title="Почему вам подходит">
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--carbon-2)' }}>
            {idea.why_for_you || idea.relevance_explanation}
          </p>
        </InfoBlock>

        {idea.unique_angle && (
          <InfoBlock title="Как выделиться">
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--carbon-2)' }}>{idea.unique_angle}</p>
          </InfoBlock>
        )}

        <InfoBlock title="Главный риск">
          <div style={{
            borderLeft: '3px solid var(--signal)',
            paddingLeft: 14,
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--signal)',
          }}>
            {idea.main_risk}
          </div>
        </InfoBlock>

        <InfoBlock title="Ключ к успеху">
          <div style={{
            borderLeft: '3px solid var(--carbon)',
            paddingLeft: 14,
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--carbon-2)',
          }}>
            {idea.success_factor}
          </div>
        </InfoBlock>

        {flagEntries.length > 0 && (
          <InfoBlock title={`Флаги риска · ${flagEntries.length}`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {flagEntries.map(([f, [label, type]]) => (
                <span key={f} className={`tag tag-${type}`}>{label}</span>
              ))}
            </div>
          </InfoBlock>
        )}

        {(idea.market_analogues || []).length > 0 && (
          <InfoBlock title="Примеры на рынке">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {idea.market_analogues.map(a => (
                <span key={a} className="tag tag-neutral">{a}</span>
              ))}
            </div>
          </InfoBlock>
        )}

        <div style={{ height: 90 }} />
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        marginLeft: -20, marginRight: -20,
        padding: '14px 20px 8px',
        background: 'var(--parch)',
        borderTop: '1px solid rgba(15,15,15,0.1)',
      }}>
        <button className="btn btn-fill" onClick={onBuildModel}>
          <span>Построить финансовую модель</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}
