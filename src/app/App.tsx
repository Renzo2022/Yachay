import { AppProviders } from './providers/AppProviders.tsx'
import { AppRouter } from './router/AppRouter.tsx'

export const App = () => (
  <AppProviders>
    <AppRouter />
  </AppProviders>
)
