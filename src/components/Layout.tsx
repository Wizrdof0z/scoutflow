import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Database, Users, LogOut, UserPlus, Search, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store'
import { useAppStore } from '@/store'
import { Button } from './ui/Button'
import { UserPermissions } from '@/types'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const players = useAppStore((state) => state.players)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Filter players based on search query
  const searchResults = searchQuery.trim().length > 0
    ? players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.currentTeam.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) // Show max 5 results
    : []

  const handleSearchResultClick = (playerID: string) => {
    navigate(`/player/${playerID}`)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/total-overview', label: 'Total Overview', icon: Database },
    { path: '/player-comparison', label: 'Player Comparison', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-2xl font-semibold text-primary">ScoutFlow</span>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-calm ${
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/20'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-calm"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  {searchResults.map((player) => (
                    <button
                      key={player.playerID}
                      onClick={() => handleSearchResultClick(player.playerID)}
                      className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-calm border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {player.currentTeam} · {player.positionProfile || 'Position TBD'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user && UserPermissions.canAddPlayers(user.role) && (
                <Link to="/add-player">
                  <Button className="space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add Player</span>
                  </Button>
                </Link>
              )}
              <div className="text-sm text-muted-foreground">
                {user?.name} ({user?.role})
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-6 py-6">
          <p className="text-sm text-muted-foreground text-center">
            ScoutFlow © 2025 · Professional Football Scouting Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
