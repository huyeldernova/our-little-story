import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import StoryLayout from './layout/StoryLayout'
import { MusicProvider } from './music/MusicContext'
import AdminStoryPage from './pages/AdminStoryPage'
import LoginPage from './pages/LoginPage'
import { StoryProvider, useStory } from './story/StoryContext'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return <div className="desk" style={{ minHeight: '100dvh' }} aria-busy="true" />
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

/** Story content and music only exist for signed-in users. */
function PrivateBook() {
  return (
    <RequireAuth>
      <StoryProvider>
        <MusicFromStory>
          <Routes>
            <Route path=":chapter" element={<StoryLayout />} />
            <Route path="*" element={<Navigate to="1" replace />} />
          </Routes>
        </MusicFromStory>
      </StoryProvider>
    </RequireAuth>
  )
}

function MusicFromStory({ children }: { children: ReactNode }) {
  const { story } = useStory()
  return <MusicProvider videoId={story?.music?.youtubeVideoId}>{children}</MusicProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/story/*" element={<PrivateBook />} />
          <Route path="/admin/story" element={<RequireAuth><AdminStoryPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/story/1" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
