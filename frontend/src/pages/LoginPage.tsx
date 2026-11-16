import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ApiError, BACKEND_UNAVAILABLE } from '../api/http'
import { useAuth } from '../auth/AuthContext'

const field = {
  minHeight: 48, padding: '0 14px', border: '1px solid #CDBBA3', borderRadius: 2, background: '#FFFFFF',
  fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#39342F',
} as const
const label = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10, letterSpacing: '.24em', color: '#6B6158' } as const

export default function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from.startsWith('/story') ? from : '/story/1'} replace />
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.code === BACKEND_UNAVAILABLE
            ? err.message
            : err.status === 401
            ? 'Sai tên đăng nhập hoặc mật khẩu.'
            : err.message
          : 'Không kết nối được tới máy chủ.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="desk" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
      <form onSubmit={submit} className="m7cardIn" style={{ position: 'relative', width: '100%', maxWidth: 360, background: '#FAF7F0', padding: 9, transform: 'rotate(-.6deg)', boxShadow: '0 40px 70px -30px rgba(0,0,0,.8)' }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -11, width: 96, height: 22, marginLeft: -48, background: 'rgba(199,143,145,.55)', transform: 'rotate(-3deg)' }} />
        <div style={{ border: '1px solid #CDBBA3', outline: '1px solid #E6D8C5', outlineOffset: -6, padding: '34px 22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 9, letterSpacing: '.3em', color: '#9B7663' }}>VOL. 01 · A SCRAPBOOK</span>
            <h1 style={{ margin: '8px 0 0', fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 36, lineHeight: 1 }}>Our Little Story</h1>
            <p style={{ margin: '8px 0 0', fontFamily: "'Patrick Hand', cursive", fontSize: 18, color: '#525B50' }}>Cuốn sổ này chỉ mở cho hai người.</p>
          </div>
          <label style={label}>
            TÊN ĐĂNG NHẬP
            <input style={field} name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={50} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label style={label}>
            MẬT KHẨU
            <input style={field} name="password" type="password" autoComplete="current-password" required maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && (
            <span role="alert" style={{ fontFamily: "'Patrick Hand', cursive", fontSize: 17, color: '#A8655A' }}>
              {error}
            </span>
          )}
          <button className="btn tap" type="submit" disabled={busy} style={{ minHeight: 50, background: '#39342F', color: '#FAF7F0', border: 0, borderRadius: 2, fontSize: 12, letterSpacing: '.2em', cursor: 'pointer' }}>
            {busy ? 'ĐANG MỞ…' : 'MỞ CUỐN SỔ'}
          </button>
        </div>
      </form>
    </div>
  )
}
