import { useState } from 'react'
import type { UserProfile } from '../types'
import { NexusLogo, ArrowRight } from './Icons'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <div className={`chip ${selected ? 'selected' : ''}`} onClick={onClick}>{label}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <div className="form-label">{label}</div>
      {children}
    </div>
  )
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    business_type: [],
    has_clients: false,
    has_premises: false,
    has_partners: false,
    is_main_income: true,
  })

  const set = (k: keyof UserProfile, v: unknown) => setProfile(p => ({ ...p, [k]: v }))
  const toggle = (k: keyof UserProfile, val: string) => {
    const arr = (profile[k] as string[]) || []
    set(k, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const canStep1 = profile.capital_range && profile.format && (profile.business_type?.length ?? 0) > 0 && profile.team_size

  return (
    <div className="screen">

      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-meta">
          <div className="eyebrow">Шаг {step} из 2</div>
          <div className="display-sm">{step === 1 ? 'Ваш профиль' : 'Детали'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <NexusLogo size={28} />
          <div className="step-dots">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>
        </div>
      </div>

      <div className="rule" style={{ marginBottom: 24 }} />

      {/* Form */}
      <div className="scroll-area">

        {step === 1 && (
          <div style={{ animation: 'screenIn 0.3s var(--ease) both' }}>

            <Field label="Стартовый капитал">
              <div className="chips">
                {['до 500к', '500к–2м', '2м–5м', '5м+'].map(o => (
                  <Chip key={o} label={o} selected={profile.capital_range === o} onClick={() => set('capital_range', o)} />
                ))}
              </div>
            </Field>

            <Field label="Формат бизнеса">
              <div className="chips">
                {[['offline', 'Офлайн'], ['online', 'Онлайн'], ['hybrid', 'Гибрид']].map(([v, l]) => (
                  <Chip key={v} label={l} selected={profile.format === v} onClick={() => set('format', v)} />
                ))}
              </div>
            </Field>

            <Field label="Тип клиентов">
              <div className="chips">
                {['B2C', 'B2B', 'B2G'].map(o => (
                  <Chip key={o} label={o} selected={(profile.business_type || []).includes(o)} onClick={() => toggle('business_type', o)} />
                ))}
              </div>
            </Field>

            <Field label="Команда">
              <div className="chips">
                {['1 (только я)', '2–5', '6–15', '15+'].map(o => (
                  <Chip key={o} label={o} selected={profile.team_size === o} onClick={() => set('team_size', o)} />
                ))}
              </div>
            </Field>

            <Field label="Желаемая окупаемость (мес)">
              <div className="chips">
                {['3–6', '6–12', '12–24', '24+'].map(o => (
                  <Chip key={o} label={o} selected={profile.payback_period === o} onClick={() => set('payback_period', o)} />
                ))}
              </div>
            </Field>

            <Field label="Город">
              <input className="form-input" placeholder="Москва, Казань, онлайн…"
                value={profile.city || ''} onChange={e => set('city', e.target.value)} />
            </Field>

          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'screenIn 0.3s var(--ease) both' }}>

            <Field label="Ваш опыт и навыки">
              <textarea className="form-textarea"
                placeholder="Чем занимались раньше? Профессиональные навыки?"
                value={profile.experience || ''} onChange={e => set('experience', e.target.value)} />
            </Field>

            <Field label="Что категорически не хотите">
              <textarea className="form-textarea"
                placeholder="Ресторан, МЛМ, строительство…"
                value={profile.exclusions || ''} onChange={e => set('exclusions', e.target.value)} />
            </Field>

            <Field label="Уровень технологичности">
              <div className="chips">
                {[['low', 'Низкий'], ['medium', 'Средний'], ['high', 'Высокий']].map(([v, l]) => (
                  <Chip key={v} label={l} selected={profile.tech_level === v} onClick={() => set('tech_level', v)} />
                ))}
              </div>
            </Field>

            <Field label="Риск-профиль">
              <div className="chips">
                {[['conservative', 'Консервативный'], ['moderate', 'Умеренный'], ['aggressive', 'Агрессивный']].map(([v, l]) => (
                  <Chip key={v} label={l} selected={profile.risk_profile === v} onClick={() => set('risk_profile', v)} />
                ))}
              </div>
            </Field>

            <Field label="Основной доход?">
              <div className="chips">
                <Chip label="Да, основной" selected={profile.is_main_income === true} onClick={() => set('is_main_income', true)} />
                <Chip label="Нет, побочный" selected={profile.is_main_income === false} onClick={() => set('is_main_income', false)} />
              </div>
            </Field>

            <Field label="Что уже есть">
              <div className="chips">
                <Chip label="Клиенты" selected={!!profile.has_clients} onClick={() => set('has_clients', !profile.has_clients)} />
                <Chip label="Помещение" selected={!!profile.has_premises} onClick={() => set('has_premises', !profile.has_premises)} />
                <Chip label="Партнёры" selected={!!profile.has_partners} onClick={() => set('has_partners', !profile.has_partners)} />
              </div>
            </Field>

          </div>
        )}

        <div style={{ height: 100 }} />
      </div>

      {/* Bottom actions */}
      <div style={{
        paddingTop: 16,
        display: 'flex',
        gap: 8,
        borderTop: '1px solid rgba(15,15,15,0.1)',
        paddingBottom: 8,
        background: 'var(--parch)',
        position: 'sticky',
        bottom: 0,
        marginLeft: -20,
        marginRight: -20,
        padding: '14px 20px 8px',
      }}>
        {step === 2 && (
          <button className="btn btn-ghost" onClick={() => setStep(1)}
            style={{ width: 44, minWidth: 44, padding: '10px', border: '1.5px solid rgba(15,15,15,0.15)' }}>
            <span>←</span>
          </button>
        )}
        <button
          className="btn btn-fill"
          disabled={step === 1 ? !canStep1 : false}
          onClick={step === 1 ? () => setStep(2) : () => onComplete(profile as UserProfile)}
        >
          <span>{step === 1 ? 'Далее' : 'Сгенерировать идеи'}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}
