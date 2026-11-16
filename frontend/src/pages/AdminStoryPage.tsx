import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { useIsAdmin } from '../auth/useIsAdmin'

const MAX_BYTES = 60 * 1024 * 1024
const hand = "'Patrick Hand', cursive"
const label: CSSProperties = { fontSize: 10, letterSpacing: '.24em', color: '#6B6158' }

/**
 * /admin/story — the author uploads the private story content (a .zip with story.json and
 * assets/) to the server, because it is never part of the public repository.
 */
export default function AdminStoryPage() {
  const isAdmin = useIsAdmin()
  const input = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return
    if (file.size > MAX_BYTES) {
      setResult({ ok: false, text: 'File lớn hơn 60 MB.' })
      return
    }
    setBusy(true)
    setResult(null)
    try {
      const r = await adminApi.uploadStory(file)
      setResult({ ok: true, text: `Đã nhận ${r.files} file (story.json + ${r.assets} ảnh). Mở lại cuốn sổ để xem nội dung mới.` })
      setFile(null)
      if (input.current) input.current.value = ''
    } catch (err) {
      setResult({ ok: false, text: err instanceof ApiError ? err.message : 'Không tải lên được, thử lại nhé.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="desk" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
      <form onSubmit={submit} className="m7cardIn" style={{ position: 'relative', width: '100%', maxWidth: 440, background: '#FAF7F0', padding: 9, transform: 'rotate(-.6deg)', boxShadow: '0 40px 70px -30px rgba(0,0,0,.8)', color: '#39342F' }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -11, width: 96, height: 22, marginLeft: -48, background: 'rgba(199,143,145,.55)', transform: 'rotate(-3deg)' }} />
        <div style={{ border: '1px solid #CDBBA3', outline: '1px solid #E6D8C5', outlineOffset: -6, padding: '30px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={label}>TÁC GIẢ · NỘI DUNG CUỐN SỔ</span>
            <h1 style={{ margin: '8px 0 0', fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 32, lineHeight: 1.05 }}>Tải nội dung lên</h1>
          </div>
          {!isAdmin ? (
            <p style={{ margin: 0, fontFamily: hand, fontSize: 18, color: '#525B50' }}>Trang này chỉ dành cho tác giả cuốn sổ.</p>
          ) : (
            <>
              <p style={{ margin: 0, fontFamily: hand, fontSize: 17, lineHeight: 1.4, color: '#525B50' }}>
                Chọn file .zip chứa <code>story.json</code> và thư mục <code>assets/</code> (có thể nằm trong thư mục <code>story-private/</code>). Nội dung cũ sẽ được thay toàn bộ. Tối đa 60 MB.
              </p>
              <label style={{ ...label, display: 'flex', flexDirection: 'column', gap: 8 }}>
                FILE .ZIP
                <input ref={input} type="file" accept=".zip,application/zip" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, letterSpacing: 0, color: '#39342F' }} />
              </label>
              <button className="btn tap" type="submit" disabled={busy || !file} style={{ minHeight: 50, background: '#39342F', color: '#FAF7F0', border: 0, borderRadius: 2, fontSize: 12, letterSpacing: '.2em', cursor: 'pointer' }}>
                {busy ? 'ĐANG TẢI LÊN…' : 'TẢI LÊN'}
              </button>
              {result && (
                <span role={result.ok ? 'status' : 'alert'} style={{ fontFamily: hand, fontSize: 17, color: result.ok ? '#525B50' : '#A8655A' }}>{result.text}</span>
              )}
            </>
          )}
          <Link to="/story/1" style={{ alignSelf: 'flex-start', fontFamily: hand, fontSize: 17, color: '#39342F' }}>← Về cuốn sổ</Link>
        </div>
      </form>
    </div>
  )
}
