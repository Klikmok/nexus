import { useState } from 'react'
import { NexusLogoMark } from './Icons'

interface LoginProps {
  isRegister?: boolean
  onLogin?: (email: string, password: string) => void
  onRegister?: (email: string, password: string, fullName: string) => void
  onSwitchLogin?: () => void
  onSwitchRegister?: () => void
  loading?: boolean
}

export function Login({ isRegister = false, onLogin, onRegister, onSwitchLogin, onSwitchRegister, loading = false }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegister) {
      onRegister?.(email, password, fullName)
    } else {
      onLogin?.(email, password)
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--pad)', maxWidth: 480, width: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div className="top-bar s1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NexusLogoMark size={38} />
          <div>
            <div style={{ fontFamily: 'var(--f)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--t1)', lineHeight: 1 }}>NEXUS</div>
            <div className="t-label" style={{ marginTop: 3, color: 'var(--cyan)', opacity: 0.7 }}>v0.3 · Business Ideas</div>
          </div>
        </div>
        <span className="badge badge-cyan">Beta</span>
      </div>

      {/* Title */}
      <div className="s3" style={{ textAlign: 'center', padding: '40px 4px 24px' }}>
        <div className="t-hero" style={{ marginBottom: 12 }}>
          {isRegister ? 'Создать аккаунт' : 'Вход'}
        </div>
        <div className="t-body" style={{ maxWidth: 290, margin: '0 auto', lineHeight: 1.7, color: 'var(--t2)' }}>
          {isRegister 
            ? 'Зарегистрируйтесь, чтобы начать генерировать идеи'
            : 'Войдите в свой аккаунт для продолжения'}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {isRegister && (
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--t2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Ваше имя
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Иван Петров"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--t1)',
                fontFamily: 'var(--f)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: 8, color: 'var(--t2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@domain.com"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--t1)',
              fontFamily: 'var(--f)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, color: 'var(--t2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--t1)',
              fontFamily: 'var(--f)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 'auto',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, var(--cyan) 0%, var(--lime) 100%)',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            color: '#000',
            fontFamily: 'var(--f)',
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 200ms var(--ease)',
          }}
        >
          {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
        </button>
      </form>

      {/* Switch form */}
      <div style={{ textAlign: 'center', color: 'var(--t2)', fontSize: 14 }}>
        {isRegister ? (
          <>
            Уже есть аккаунт?{' '}
            <button
              onClick={onSwitchLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cyan)',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Войти
            </button>
          </>
        ) : (
          <>
            Нет аккаунта?{' '}
            <button
              onClick={onSwitchRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cyan)',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Зарегистрироваться
            </button>
          </>
        )}
      </div>
    </div>
  )
}
