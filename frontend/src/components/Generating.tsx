import { useEffect, useState } from 'react'
import { getSessionStatus } from '../api'
import type { IdeaCard } from '../types'
import { LoaderGeometric } from './Icons'

interface GeneratingProps {
  sessionId: string
  onDone: (ideas: IdeaCard[]) => void
  onError: (msg: string) => void
}

const STEPS = [
  { label: 'Анализируем профиль', pct: 10 },
  { label: 'Генерируем 8 идей', pct: 25 },
  { label: 'Финансовый фильтр', pct: 45 },
  { label: 'Рыночный анализ', pct: 62 },
  { label: 'Операционная оценка', pct: 78 },
  { label: 'Отбираем топ-6', pct: 88 },
  { label: 'Обогащаем карточки', pct: 96 },
]

export function Generating({ sessionId, onDone, onError }: GeneratingProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [pct, setPct] = useState(5)

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const s = await getSessionStatus(sessionId)
        if (s.status === 'done') { clearInterval(poll); onDone(s.ideas as IdeaCard[]) }
        if (s.status === 'error') { clearInterval(poll); onError(s.error || 'Ошибка') }
      } catch { /* silent */ }
      setStepIdx(i => {
        const next = Math.min(i + 1, STEPS.length - 1)
        setPct(STEPS[next].pct)
        return next
      })
    }, 3200)
    return () => clearInterval(poll)
  }, [sessionId])

  const step = STEPS[stepIdx]

  return (
    <div className="screen">
      <div className="loader-wrap">

        <LoaderGeometric />

        <div style={{ textAlign: 'center' }}>
          <div className="display-md" style={{ marginBottom: 8 }}>NEXUS</div>
          <div className="loader-status" key={step.label}>{step.label}…</div>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 220 }}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <div className="eyebrow">AI-анализ</div>
            <div className="eyebrow">{pct}%</div>
          </div>
        </div>

        {/* Step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 240 }}>
          {STEPS.map((s, i) => (
            <div key={s.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              opacity: i > stepIdx ? 0.25 : 1,
              transition: 'opacity 0.4s',
            }}>
              <div style={{
                width: 8, height: 8, flexShrink: 0,
                background: i < stepIdx ? 'var(--carbon)' : i === stepIdx ? 'var(--signal)' : 'var(--parch-3)',
                transition: 'background 0.3s',
              }} />
              <div className="eyebrow" style={{ color: i === stepIdx ? 'var(--carbon)' : 'var(--carbon-4)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="eyebrow" style={{ opacity: 0.4 }}>~30–60 секунд</div>
      </div>
    </div>
  )
}
