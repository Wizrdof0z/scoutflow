import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PlayerEntryPage from './pages/PlayerEntryPage'
import PlayerProfilePage from './pages/PlayerProfilePage'
import PlayerListPage from './pages/PlayerListPage'
import VerdictListPage from './pages/VerdictListPage'
import TotalOverviewPage from './pages/TotalOverviewPage'
import PlayerComparisonPage from './pages/PlayerComparisonPage'
import LiveScoutingPage from './pages/LiveScoutingPage'
import SettingsPage from './pages/SettingsPage'
import SkillCornerPlayerProfilePage from './pages/SkillCornerPlayerProfilePage'
import SkillCornerViewsPage from './pages/SkillCornerViewsPage'
import LoginPage from './pages/LoginPage'
import { useAuthStore } from './store'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
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
          <Route path="player-comparison" element={<PlayerComparisonPage />} />
          <Route path="live-scouting" element={<LiveScoutingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="skillcorner/views" element={<SkillCornerViewsPage />} />
          <Route path="skillcorner/player/:playerId" element={<SkillCornerPlayerProfilePage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
