import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store'
import { calculateAge } from '@/utils/helpers'
import { ArrowLeft, User } from 'lucide-react'
import type { Player } from '@/types'

export default function PlayerListPage() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  useEffect(() => {
    if (!category) return
    
    setIsLoading(true)
    try {
      // Filter players by currentList
      const filtered = players.filter(p => p.currentList === category)
      setFilteredPlayers(filtered)
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setIsLoading(false)
    }
  }, [category, players])

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Continue Monitoring':
        return 'monitoring'
      case 'Not Good Enough':
        return 'notgood'
      case 'Discuss Further':
        return 'discuss'
      case 'Scouting Team Follow-ups':
        return 'followup'
      default:
        return 'muted'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div>
        <h1>{category}</h1>
        <p className="text-muted-foreground mt-2">
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Player List */}
      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">
              Loading players...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No players in this list yet.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlayers.map((player) => {
                const age = calculateAge(player.dateOfBirth)
                
                return (
                  <Link
                    key={player.playerID}
                    to={`/player/${player.playerID}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/10 transition-calm hover-lift">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-lg">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.currentTeam} • {player.currentLeague}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {player.positionProfile || 'Position TBD'} • {age} years • {player.nationality}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge variant={getCategoryColor(category || '') as any}>
                          {category}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {player.matchesPlayed} matches
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
