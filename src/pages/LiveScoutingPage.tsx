import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAppStore } from '@/store'
import { calculateAge } from '@/utils/helpers'
import type { Player } from '@/types'

export default function LiveScoutingPage() {
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  
  const [liveScoutingPlayers, setLiveScoutingPlayers] = useState<Player[]>([])

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  useEffect(() => {
    const filtered = players.filter(p => p.currentList === 'Live scouting list')
    setLiveScoutingPlayers(filtered)
  }, [players])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Live Scouting List</h1>
        <p className="text-muted-foreground mt-2">
          Players ready for live match scouting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Players to Watch Live ({liveScoutingPlayers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {liveScoutingPlayers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No players in live scouting list yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Position</th>
                    <th className="pb-3 font-medium">Age</th>
                    <th className="pb-3 font-medium">Team</th>
                    <th className="pb-3 font-medium">League</th>
                    <th className="pb-3 font-medium">Contract Until</th>
                    <th className="pb-3 font-medium">Matches Played</th>
                  </tr>
                </thead>
                <tbody>
                  {liveScoutingPlayers.map((player) => {
                    const age = player.dateOfBirth ? calculateAge(player.dateOfBirth) : null
                    
                    return (
                      <tr key={player.playerID} className="border-b hover:bg-accent/5">
                        <td className="py-3">
                          <Link 
                            to={`/player/${player.playerID}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {player.name}
                          </Link>
                        </td>
                        <td className="py-3">{player.positionProfile || 'TBD'}</td>
                        <td className="py-3">{age || 'N/A'}</td>
                        <td className="py-3">{player.currentTeam}</td>
                        <td className="py-3">{player.currentLeague || 'N/A'}</td>
                        <td className="py-3">
                          {player.contractEndDate 
                            ? new Date(player.contractEndDate).toLocaleDateString('en-GB', { 
                                year: 'numeric', 
                                month: 'short' 
                              })
                            : 'N/A'}
                        </td>
                        <td className="py-3">{player.matchesPlayed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
