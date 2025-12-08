import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '../../core/layouts/AppLayout.tsx'
import { ProtectedRoute } from '../../features/auth/ProtectedRoute.tsx'
import { LoginView } from '../../features/auth/LoginView.tsx'
import { DashboardView } from '../../features/projects/views/DashboardView.tsx'
import { ProjectLayout } from '../../features/projects/layouts/ProjectLayout.tsx'
import { Phase1View } from '../../features/phase1_planning/views/Phase1View.tsx'
import { Phase2View } from '../../features/phase2_search/views/Phase2View.tsx'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardView />} />
        </Route>
        <Route path="/project/:projectId" element={<ProjectLayout />}>
          <Route index element={<Navigate to="phase1" replace />} />
          <Route path="phase1" element={<Phase1View />} />
          <Route path="phase2" element={<Phase2View />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
