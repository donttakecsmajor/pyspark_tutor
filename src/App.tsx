import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { PathPage } from './pages/PathPage'
import { LessonPage } from './pages/LessonPage'
import { CheckpointPage } from './pages/CheckpointPage'
import { PracticePage } from './pages/PracticePage'
import { ReferencePage } from './pages/ReferencePage'
import { ProfilePage } from './pages/ProfilePage'
import { PlacementPage } from './pages/PlacementPage'
import { PlanPage } from './pages/PlanPage'
import { WelcomePage } from './pages/WelcomePage'
import { useProgress } from './store/progressStore'
import { initCurriculum } from './data'

initCurriculum()

function Gate({ children }: { children: React.ReactNode }) {
  const onboardingDone = useProgress((s) => s.onboardingDone)
  if (!onboardingDone) return <Navigate to="/welcome" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter basename="/pyspark_tutor">
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <Gate>
                <PathPage />
              </Gate>
            }
          />
          <Route
            path="/practice"
            element={
              <Gate>
                <PracticePage />
              </Gate>
            }
          />
          <Route
            path="/reference"
            element={
              <Gate>
                <ReferencePage />
              </Gate>
            }
          />
          <Route
            path="/profile"
            element={
              <Gate>
                <ProfilePage />
              </Gate>
            }
          />
          {/* Deliberately NOT behind Gate: a shared lesson link must open
              straight into the lesson, no onboarding first. */}
          <Route path="/lesson/:chapterId/:stepId" element={<LessonPage />} />
          <Route
            path="/checkpoint/:chapterId"
            element={
              <Gate>
                <CheckpointPage />
              </Gate>
            }
          />
          {/* Onboarding flow: reachable before onboardingDone, so not behind Gate. */}
          <Route path="/placement/:track" element={<PlacementPage />} />
          <Route path="/plan/:track" element={<PlanPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
