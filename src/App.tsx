import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PlayerEntryPage from './pages/PlayerEntryPage'
import PlayerProfilePage from './pages/PlayerProfilePage'
import PlayerListPage from './pages/PlayerListPage'
import VerdictListPage from './pages/VerdictListPage'
import TotalOverviewPage from './pages/TotalOverviewPage'
import { useAuthStore } from './store'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">ScoutFlow</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="add-player" element={<PlayerEntryPage />} />
          <Route path="player/:playerID" element={<PlayerProfilePage />} />
          <Route path="list/:category" element={<PlayerListPage />} />
          <Route path="verdict/:type/:verdict" element={<VerdictListPage />} />
          <Route path="total-overview" element={<TotalOverviewPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
