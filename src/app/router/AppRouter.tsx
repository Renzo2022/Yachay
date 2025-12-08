import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '../../core/layouts/AppLayout.tsx'
import { ProtectedRoute } from '../../features/auth/ProtectedRoute.tsx'
import { LoginView } from '../../features/auth/LoginView.tsx'
import { DashboardView } from '../../features/projects/views/DashboardView.tsx'
import { ProjectDetailPlaceholder } from '../../features/projects/views/ProjectDetailPlaceholder.tsx'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardView />} />
          <Route path="/project/:projectId/dashboard" element={<ProjectDetailPlaceholder />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
