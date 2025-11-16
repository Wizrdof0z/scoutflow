import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, UserPlus, Database, Users, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button } from './ui/Button'

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/add-player', label: 'Add Player', icon: UserPlus },
    { path: '/total-overview', label: 'Total Overview', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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

            <div className="flex items-center space-x-4">
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
