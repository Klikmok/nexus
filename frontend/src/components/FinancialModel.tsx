import { useState, useEffect } from 'react'
import type { IdeaCard, FinancialModel } from '../types'
import { createFinancialModel } from '../api'
import { LoaderGeometric, ChevronLeft } from './Icons'

interface FinancialProps {
  idea: IdeaCard
  sessionId: string
  onBack: () => void
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн`
  if (abs >= 1_000)     return `${(n / 1000).toFixed(0)} тыс`
  return `${Math.round(n)}`
}

function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
        <div className="form-label">{label}</div>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, lineHeight: 1 }}>{display}</div>
      </div>
      <div style={{ position: 'relative' }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))} />
        <div style={{
          position: 'absolute', left: `${pct}%`, bottom: '100%',
          transform: 'translateX(-50%)',
          width: 1, height: 8,
          background: 'var(--carbon)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div className="eyebrow">{fmt(min)}</div>
        <div className="eyebrow">{fmt(max)}</div>
      </div>
    </div>
  )
}

export function FinancialModelScreen({ idea, sessionId, onBack }: FinancialProps) {
  const [model, setModel] = useState<FinancialModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState('')
  const [adj, setAdj] = useState<Record<string, number>>({})
  const [scenario, setScenario] = useState<'pessimistic' | 'base' | 'optimistic'>('base')

  async function load(adjustments: Record<string, number> = {}) {
    try {
      const result = await createFinancialModel(sessionId, idea.id, adjustments) as FinancialModel
      setModel(result)
      if (!Object.keys(adj).length) {
        // initialise sliders to base assumptions
        setAdj({
          avg_check:        result.assumptions.avg_check_rub,
          monthly_clients:  result.assumptions.monthly_clients_base,
          fixed_costs:      result.assumptions.fixed_costs_monthly.total,
        })
      }
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function recalculate() {
    setRecalculating(true)
    await load(adj)
    setRecalculating(false)
  }

  if (loading) return (
    <div className="screen">
      <div className="loader-wrap">
        <LoaderGeometric />
        <div className="loader-status">Строим финансовую модель…</div>
      </div>
    </div>
  )

  if (error || !model) return (
    <div className="screen">
      <button className="btn btn-ghost" onClick={onBack}><ChevronLeft size={13} /><span>Назад</span></button>
      <div style={{ marginTop: 24, color: 'var(--signal)', fontSize: 13 }}>{error || 'Ошибка загрузки'}</div>
    </div>
  )

  const a  = model.assumptions
  const sc = model.scenarios[scenario]
  const ue = model.unit_economics || {}

  const scenarioLabels = { pessimistic: 'Пессим.', base: 'Базовый', optimistic: 'Оптимист.' } as const
  const profitColor = sc.monthly_profit >= 0 ? 'var(--carbon)' : 'var(--signal)'

  return (
    <div className="screen">
      <button className="btn btn-ghost" onClick={onBack}
        style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ChevronLeft size={13} />
        <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Идея</span>
      </button>

      <div className="eyebrow" style={{ marginBottom: 4 }}>{idea.title}</div>
      <div className="display-md" style={{ marginBottom: 16 }}>Финмодель</div>

      <div className="rule" style={{ marginBottom: 0 }} />

      <div className="scroll-area">

        {/* Scenario selector */}
        <div style={{ marginTop: 16, marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Выберите сценарий</div>
          <div className="scenario-grid">
            {(['pessimistic', 'base', 'optimistic'] as const).map(s => (
              <div key={s} className={`scenario-cell ${scenario === s ? 'active' : ''}`} onClick={() => setScenario(s)}>
                <div className="eyebrow">{scenarioLabels[s]}</div>
                <span className="scenario-val" style={{
                  color: scenario === s
                    ? (model.scenarios[s].monthly_profit >= 0 ? 'var(--parch)' : '#ff8070')
                    : (model.scenarios[s].monthly_profit >= 0 ? 'var(--carbon)' : 'var(--signal)')
                }}>
                  {fmt(model.scenarios[s].monthly_profit)}
                </span>
                <div className="eyebrow" style={{ marginTop: 2, fontSize: 8 }}>₽/мес</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            ['Выручка / мес',    fmt(sc.monthly_revenue) + ' ₽',  false],
            ['Прибыль / мес',   fmt(sc.monthly_profit) + ' ₽',   sc.monthly_profit < 0],
            ['Точка безубыт.',  `${sc.breakeven_clients} кл.`,   false],
            ['Окупаемость',     sc.payback_months ? `${sc.payback_months} мес` : '—', !sc.payback_months],
          ].map(([label, val, isNeg]) => (
            <div key={label as string} className="stat-cell">
              <div className="eyebrow">{label as string}</div>
              <span className="stat-val" style={{ color: isNeg ? 'var(--signal)' : 'var(--carbon)' }}>
                {val as string}
              </span>
            </div>
          ))}
        </div>

        {/* Sliders */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="eyebrow">Настройте параметры</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(15,15,15,0.1)' }} />
          </div>

          <SliderRow
            label="Средний чек" value={adj.avg_check ?? a.avg_check_rub}
            min={Math.round(a.avg_check_rub * 0.3)} max={Math.round(a.avg_check_rub * 3)}
            step={500} display={`${fmt(adj.avg_check ?? a.avg_check_rub)} ₽`}
            onChange={v => setAdj(p => ({ ...p, avg_check: v }))}
          />
          <SliderRow
            label="Клиентов в месяц" value={adj.monthly_clients ?? a.monthly_clients_base}
            min={1} max={a.monthly_clients_mature * 2}
            step={1} display={`${adj.monthly_clients ?? a.monthly_clients_base} чел.`}
            onChange={v => setAdj(p => ({ ...p, monthly_clients: v }))}
          />
          <SliderRow
            label="Постоянные расходы" value={adj.fixed_costs ?? a.fixed_costs_monthly.total}
            min={Math.round(a.fixed_costs_monthly.total * 0.4)}
            max={Math.round(a.fixed_costs_monthly.total * 2.5)}
            step={5000} display={`${fmt(adj.fixed_costs ?? a.fixed_costs_monthly.total)} ₽`}
            onChange={v => setAdj(p => ({ ...p, fixed_costs: v }))}
          />

          <button className="btn" onClick={recalculate} disabled={recalculating}>
            <span>{recalculating ? 'Пересчитываем…' : 'Пересчитать'}</span>
          </button>
        </div>

        {/* Unit economics */}
        {ue.cac_rub !== undefined && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="eyebrow">Юнит-экономика</div>
              <div style={{ flex: 1, height: 1, background: 'rgba(15,15,15,0.1)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(15,15,15,0.1)', border: '1px solid rgba(15,15,15,0.1)', marginBottom: 8 }}>
              {[
                ['CAC', fmt(ue.cac_rub) + ' ₽'],
                ['LTV', fmt(ue.ltv_rub) + ' ₽'],
                ['LTV/CAC', (ue.ltv_cac_ratio || 0).toFixed(1)],
              ].map(([l, v]) => (
                <div key={l} style={{ background: 'var(--paper)', padding: '12px 8px', textAlign: 'center' }}>
                  <div className="eyebrow">{l}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>

            {ue.ltv_cac_verdict && (
              <div className="eyebrow" style={{ opacity: 0.5 }}>{ue.ltv_cac_verdict}</div>
            )}
          </div>
        )}

        {/* Validation warnings */}
        {(model.validation_warnings || []).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {model.validation_warnings.map(w => (
              <div key={w} className="fin-warning" style={{ marginBottom: 8 }}>
                ⚠ {w.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {a.assumptions_notes && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="eyebrow">Допущения модели</div>
              <div style={{ flex: 1, height: 1, background: 'rgba(15,15,15,0.1)' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--carbon-4)', lineHeight: 1.7 }}>{a.assumptions_notes}</p>
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
