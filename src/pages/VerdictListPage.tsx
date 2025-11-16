import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store'
import { getCurrentSeason, calculateAge, formatDate } from '@/utils/helpers'
import { getLiveScoutingCategory } from '@/types'
import { ArrowLeft, Users } from 'lucide-react'
import type { Player } from '@/types'

export default function VerdictListPage() {
  const { type, verdict } = useParams<{ type: string; verdict: string }>()
  const navigate = useNavigate()
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  const getDataScoutingEntry = useAppStore((state) => state.getDataScoutingEntry)
  const getVideoscoutingEntry = useAppStore((state) => state.getVideoscoutingEntry)
  const getLiveScoutingEntry = useAppStore((state) => state.getLiveScoutingEntry)
  
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])
  
  useEffect(() => {
    async function filterPlayers() {
      setIsLoading(true)
      const currentSeason = getCurrentSeason()
      const filtered: Player[] = []
      
      for (const player of players) {
        let matches = false
        
        if (type === 'data') {
          try {
            const dataEntry = await getDataScoutingEntry(player.playerID, currentSeason.seasonID)
            if (dataEntry?.dataVerdict === verdict) {
              matches = true
            }
          } catch (e) { /* ignore */ }
        } else if (type === 'video') {
          try {
            const videoEntry = await getVideoscoutingEntry(player.playerID, currentSeason.seasonID)
            // Check if either Kyle or Toer has the matching verdict
            if (videoEntry?.kyleVerdict === verdict || videoEntry?.toerVerdict === verdict) {
              matches = true
            }
          } catch (e) { /* ignore */ }
        } else if (type === 'live') {
          try {
            const liveEntry = await getLiveScoutingEntry(player.playerID, currentSeason.seasonID)
            if (liveEntry?.liveScoutingPercentage) {
              const category = getLiveScoutingCategory(liveEntry.liveScoutingPercentage)
              if (category === verdict) {
                matches = true
              }
            }
          } catch (e) { /* ignore */ }
        }
        
        if (matches) {
          filtered.push(player)
        }
      }
      
      setFilteredPlayers(filtered)
      setIsLoading(false)
    }
    
    if (players.length > 0 && type && verdict) {
      filterPlayers()
    }
  }, [players, type, verdict, getDataScoutingEntry, getVideoscoutingEntry, getLiveScoutingEntry])
  
  const getTitle = () => {
    if (type === 'data') return `Data Verdict: ${verdict}`
    if (type === 'video') return `Video Verdict: ${verdict}`
    if (type === 'live') return `Live Scouting: ${verdict}`
    return 'Players'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">{getTitle()}</h1>
            <p className="text-muted-foreground mt-1">
              {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Player List */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading players...
        </div>
      ) : filteredPlayers.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No players found with this verdict</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <Link key={player.playerID} to={`/player/${player.playerID}`}>
              <Card className="p-6 hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(player.dateOfBirth)} years • {formatDate(player.dateOfBirth)}
                      </p>
                    </div>
                    {player.positionProfile && (
                      <Badge variant="default">{player.positionProfile}</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{player.currentTeam}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {player.currentLeague}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Badge variant="default" className="text-xs">
                      {player.currentList}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
