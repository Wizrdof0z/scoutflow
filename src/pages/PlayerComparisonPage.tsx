import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { X } from 'lucide-react'
import { getCurrentSeason } from '@/utils/helpers'
import type { Player, PlayerRating } from '@/types'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts'

export default function PlayerComparisonPage() {
  const players = useAppStore((state) => state.players)
  const getPlayerRatings = useAppStore((state) => state.getPlayerRatings)

  // Filters
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [selectedSubProfile, setSelectedSubProfile] = useState<string>('all')
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all')
  
  // Selected players
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  
  // Chart type
  const [chartType, setChartType] = useState<'bar' | 'radar'>('radar')
  
  // Player ratings data
  const [playersRatingsData, setPlayersRatingsData] = useState<Record<string, PlayerRating | null>>({})

  // Get unique competitions
  const competitions = ['all', ...Array.from(new Set(players.map(p => p.currentLeague).filter(Boolean))).sort()]

  // Get unique positions - use predefined list
  const positions = [
    'all',
    'Goalkeeper',
    'Centre Back',
    'Left Fullback',
    'Right Fullback',
    'Defensive Midfielder',
    'Central Midfielder',
    'Attacking Midfielder',
    'Left Winger',
    'Right Winger',
    'Centre Forward'
  ]

  // Position to SubProfile mapping
  const positionSubProfiles: Record<string, string[]> = {
    'Centre Back': ['Technical Centre Back', 'Physical Centre Back'],
    'Left Fullback': ['Technical Fullback', 'Intense Fullback'],
    'Right Fullback': ['Technical Fullback', 'Intense Fullback'],
    'Defensive Midfielder': ['Pivot', 'Box-to-Box'],
    'Central Midfielder': ['Pivot', 'Box-to-Box'],
    'Left Winger': ['Inverted Winger', 'Traditional Winger'],
    'Right Winger': ['Inverted Winger', 'Traditional Winger'],
    'Centre Forward': ['Second Striker', 'Direct Striker'],
  }

  // Get subprofiles based on selected position
  const getSubprofilesForPosition = (position: string): string[] => {
    if (position === 'all') {
      // Get all unique subprofiles
      const allSubs = new Set<string>()
      Object.values(positionSubProfiles).forEach(subs => {
        subs.forEach(sub => allSubs.add(sub))
      })
      return ['all', ...Array.from(allSubs)]
    }
    const subs = positionSubProfiles[position]
    return subs ? ['all', ...subs] : ['all']
  }

  const subprofiles = getSubprofilesForPosition(selectedPosition)

  // Reset subprofile when position changes if current subprofile is not valid
  useEffect(() => {
    if (!subprofiles.includes(selectedSubProfile)) {
      setSelectedSubProfile('all')
    }
  }, [selectedPosition])

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | undefined): number => {
    if (!dateOfBirth) return 0
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      if (isNaN(birthDate.getTime())) return 0
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return 0
    }
  }

  // Filter players based on criteria
  const filteredPlayers = players.filter(player => {
    const competitionMatch = selectedCompetition === 'all' || player.currentLeague === selectedCompetition
    const positionMatch = selectedPosition === 'all' || player.positionProfile === selectedPosition
    const subProfileMatch = selectedSubProfile === 'all' || player.positionProfile === selectedSubProfile
    
    return competitionMatch && positionMatch && subProfileMatch && !selectedPlayers.find(p => p.playerID === player.playerID)
  })

  // Load ratings for selected players
  useEffect(() => {
    const loadRatings = async () => {
      const currentSeason = getCurrentSeason()
      const seasonID = currentSeason.seasonID
      const ratingsData: Record<string, PlayerRating | null> = {}
      for (const player of selectedPlayers) {
        const rating = await getPlayerRatings(player.playerID, seasonID)
        ratingsData[player.playerID] = rating
      }
      setPlayersRatingsData(ratingsData)
    }
    
    if (selectedPlayers.length > 0) {
      loadRatings()
    }
  }, [selectedPlayers, getPlayerRatings])

  const handleAddPlayer = (playerID: string) => {
    try {
      if (selectedPlayers.length < 5 && playerID) {
        const player = players.find(p => p.playerID === playerID)
        if (player && !selectedPlayers.find(p => p.playerID === playerID)) {
          setSelectedPlayers([...selectedPlayers, player])
        }
      }
    } catch (error) {
      console.error('Error adding player:', error)
    }
  }

  const handleRemovePlayer = (playerID: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.playerID !== playerID))
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // Prepare chart data
  const prepareChartData = () => {
    if (selectedPlayers.length === 0) return []

    try {
      const metrics = [
        { key: 'physical', label: 'Physical' },
        { key: 'movement', label: 'Movement' },
        { key: 'passing', label: 'Passing' },
        { key: 'pressure', label: 'Pressure' },
        { key: 'defensive', label: 'Defensive Actions' },
      ]

      if (chartType === 'radar') {
        const data = metrics.map(metric => {
          const dataPoint: any = { metric: metric.label }
          selectedPlayers.forEach(player => {
            const ratings = playersRatingsData[player.playerID]
            const value = ratings?.[metric.key as keyof PlayerRating] || 0
            dataPoint[player.name] = value
          })
          return dataPoint
        })
        return data
      } else {
        // Bar chart data
        const data: any[] = []
        selectedPlayers.forEach(player => {
          const ratings = playersRatingsData[player.playerID]
          const playerData: any = { player: player.name }
          metrics.forEach(metric => {
            playerData[metric.label] = ratings?.[metric.key as keyof PlayerRating] || 0
          })
          data.push(playerData)
        })
        return data
      }
    } catch (error) {
      console.error('Error preparing chart data:', error)
      return []
    }
  }

  const chartData = prepareChartData()

  // Prepare Overall Rating data
  const prepareOverallData = () => {
    try {
      return selectedPlayers.map((player, index) => {
        const ratings = playersRatingsData[player.playerID]
        return {
          player: player.name || 'Unknown',
          overall: ratings?.overall || 0,
          color: colors[index],
        }
      })
    } catch (error) {
      console.error('Error preparing overall data:', error)
      return []
    }
  }

  const overallData = prepareOverallData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Player Comparison</h1>
        <p className="text-muted-foreground mt-2">Compare up to 5 players side by side</p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Competition</Label>
              <Select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
              >
                {competitions.map(comp => (
                  <option key={comp} value={comp}>
                    {comp === 'all' ? 'All Competitions' : comp}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Position</Label>
              <Select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>
                    {pos === 'all' ? 'All Positions' : pos}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>SubProfile</Label>
              <Select
                value={selectedSubProfile}
                onChange={(e) => setSelectedSubProfile(e.target.value)}
              >
                {subprofiles.map(sub => (
                  <option key={sub} value={sub}>
                    {sub === 'all' ? 'All SubProfiles' : sub}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Player Selection Dropdown */}
          <div className="mt-4">
            <Label>Select Players to Compare ({selectedPlayers.length}/5)</Label>
            <Select
              value=""
              onChange={(e) => handleAddPlayer(e.target.value)}
              disabled={selectedPlayers.length >= 5 || filteredPlayers.length === 0}
              className="w-full"
            >
              <option value="" disabled>
                {filteredPlayers.length === 0 ? 'No players available' : 'Choose a player...'}
              </option>
              {filteredPlayers.map((player) => {
                const age = calculateAge(player.dateOfBirth)
                return (
                  <option key={player.playerID} value={player.playerID}>
                    {player.name} - {player.currentTeam} ({player.positionProfile || 'N/A'}, Age {age > 0 ? age : 'N/A'})
                  </option>
                )
              })}
            </Select>
          </div>

          {/* Selected Players */}
          {selectedPlayers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedPlayers.map((player, index) => (
                <Badge key={player.playerID} variant="default" className="px-3 py-2 text-sm flex items-center gap-2">
                  <span style={{ color: colors[index] }}>●</span>
                  {player.name}
                  <button
                    onClick={() => handleRemovePlayer(player.playerID)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlayers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rating Comparison</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={chartType === 'radar' ? 'default' : 'outline'}
                    onClick={() => setChartType('radar')}
                  >
                    Radar Chart
                  </Button>
                  <Button
                    size="sm"
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    onClick={() => setChartType('bar')}
                  >
                    Bar Chart
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 400 }}>
                {chartType === 'radar' ? (
                  <ResponsiveContainer>
                    <RadarChart data={chartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      {selectedPlayers.map((player, index) => (
                        <Radar
                          key={player.playerID}
                          name={player.name}
                          dataKey={player.name}
                          stroke={colors[index]}
                          fill={colors[index]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="player" />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="Physical" fill="#3b82f6" />
                      <Bar dataKey="Movement" fill="#10b981" />
                      <Bar dataKey="Passing" fill="#f59e0b" />
                      <Bar dataKey="Pressure" fill="#ef4444" />
                      <Bar dataKey="Defensive Actions" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Overall Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Rating Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={overallData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="player" width={150} />
                    <RechartsTooltip />
                    <Bar dataKey="overall" fill="#3b82f6">
                      {overallData.map((entry, index) => (
                        <Bar key={`bar-${index}`} dataKey="overall" fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Overall Rating Values */}
              <div className="mt-4 space-y-2">
                {selectedPlayers.map((player, index) => {
                  const ratings = playersRatingsData[player.playerID]
                  return (
                    <div key={player.playerID} className="flex items-center justify-between p-2 bg-accent/10 rounded">
                      <div className="flex items-center gap-2">
                        <span style={{ color: colors[index], fontSize: '1.2rem' }}>●</span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: colors[index] }}>
                        {ratings?.overall ? ratings.overall.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedPlayers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Select players using the filters above to start comparing</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
