import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase'
import { calculateAge, formatStatValue, getPositionGroup } from '@/utils/position-helpers'

interface PhysicalData {
  player_name: string
  player_short_name: string
  player_id: number
  player_birthdate: string
  team_name: string
  team_id: number
  competition_name: string
  season_name: string
  season_id: number
  position: string
  position_group: string
  minutes_full_all: number
  count_match: number
  count_match_failed: number
  timetohsr_top3: number | null
  timetohsrpostcod_top3: number | null
  timetosprint_top3: number | null
  timetosprintpostcod_top3: number | null
  timeto505around90_top3: number | null
  timeto505around180_top3: number | null
  psv99: number | null
  psv99_top5: number | null
  total_distance_full_all_p90: number | null
  total_metersperminute_full_all_p90: number | null
  running_distance_full_all_p90: number | null
  hsr_distance_full_all_p90: number | null
  hsr_count_full_all_p90: number | null
  sprint_distance_full_all_p90: number | null
  sprint_count_full_all_p90: number | null
  hi_distance_full_all_p90: number | null
  hi_count_full_all_p90: number | null
  medaccel_count_full_all_p90: number | null
  highaccel_count_full_all_p90: number | null
  meddecel_count_full_all_p90: number | null
  highdecel_count_full_all_p90: number | null
  cod_count_full_all_p90: number | null
  explacceltohsr_count_full_all_p90: number | null
  explacceltosprint_count_full_all_p90: number | null
}

interface PositionData {
  positionGroup: string
  matches: number
  data: PhysicalData[]
}

export default function SkillCornerPlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [physicalData, setPhysicalData] = useState<PhysicalData[]>([])
  
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedPositionGroup, setSelectedPositionGroup] = useState<string>('')
  
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([])
  const [positionsBySeasonAndGroup, setPositionsBySeasonAndGroup] = useState<Map<string, PositionData[]>>(new Map())

  useEffect(() => {
    if (playerId) {
      fetchPhysicalDataFromDatabase()
    }
  }, [playerId])

  useEffect(() => {
    if (physicalData.length > 0) {
      processData()
    }
  }, [physicalData])

  useEffect(() => {
    if (selectedSeason && positionsBySeasonAndGroup.has(selectedSeason)) {
      // Auto-select position with most matches
      const positions = positionsBySeasonAndGroup.get(selectedSeason)!
      const topPosition = positions.reduce((prev, current) => 
        current.matches > prev.matches ? current : prev
      )
      setSelectedPositionGroup(topPosition.positionGroup)
    }
  }, [selectedSeason, positionsBySeasonAndGroup])

  const fetchPhysicalDataFromDatabase = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: dbError } = await supabase
        .from('physical_p90')
        .select('*')
        .eq('player_id', playerId)

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      if (!data || data.length === 0) {
        setError('No physical data found for this player in the database')
        return
      }

      setPhysicalData(data as PhysicalData[])
    } catch (err) {
      console.error('Error fetching physical data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch player data from database')
    } finally {
      setLoading(false)
    }
  }

  const processData = () => {
    // Get unique seasons (sorted by most recent)
    const seasons = [...new Set(physicalData.map(d => d.season_name))].sort().reverse()
    setAvailableSeasons(seasons)
    
    // Group data by season and position group
    const grouped = new Map<string, PositionData[]>()
    
    seasons.forEach(season => {
      const seasonData = physicalData.filter(d => d.season_name === season)
      
      // Group by position group
      const positionGroupMap = new Map<string, PhysicalData[]>()
      seasonData.forEach(data => {
        const group = getPositionGroup(data.position)
        if (!positionGroupMap.has(group)) {
          positionGroupMap.set(group, [])
        }
        positionGroupMap.get(group)!.push(data)
      })
      
      // Convert to array with match counts
      const positionData: PositionData[] = Array.from(positionGroupMap.entries()).map(([group, data]) => ({
        positionGroup: group,
        matches: data.reduce((sum, d) => sum + d.count_match, 0),
        data
      })).sort((a, b) => b.matches - a.matches) // Sort by match count
      
      grouped.set(season, positionData)
    })
    
    setPositionsBySeasonAndGroup(grouped)
    
    // Set initial season (most recent)
    if (seasons.length > 0) {
      setSelectedSeason(seasons[0])
    }
  }

  const getPlayerInfo = () => {
    if (physicalData.length === 0) return null
    const latest = physicalData[0]
    return {
      name: latest.player_name,
      shortName: latest.player_short_name,
      age: calculateAge(latest.player_birthdate),
      birthdate: latest.player_birthdate || 'N/A',
      team: latest.team_name,
      competition: latest.competition_name
    }
  }

  const getCurrentStats = (): PhysicalData | null => {
    if (!selectedSeason || !selectedPositionGroup || !positionsBySeasonAndGroup.has(selectedSeason)) {
      return null
    }
    
    const positions = positionsBySeasonAndGroup.get(selectedSeason)!
    const positionData = positions.find(p => p.positionGroup === selectedPositionGroup)
    
    if (!positionData || positionData.data.length === 0) return null
    
    // If multiple position entries in the same group (e.g., CF and RF both in Center Forward),
    // return the one with the most matches
    return positionData.data.reduce((prev, current) => 
      current.count_match > prev.count_match ? current : prev
    )
  }

  const playerInfo = getPlayerInfo()
  const currentStats = getCurrentStats()
  const seasonPositions = selectedSeason && positionsBySeasonAndGroup.has(selectedSeason) 
    ? positionsBySeasonAndGroup.get(selectedSeason)! 
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading player data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Error loading player data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!playerInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No player data found</p>
      </div>
    )
  }

  const totalMatchesSeason = seasonPositions.reduce((sum, p) => sum + p.matches, 0)

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{playerInfo.name}</h1>
              <p className="text-muted-foreground mt-1">{playerInfo.shortName}</p>
              <div className="flex gap-4 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <span className="ml-2 font-medium">{playerInfo.age ?? 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Birth Date:</span>
                  <span className="ml-2 font-medium">{playerInfo.birthdate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Team:</span>
                  <span className="ml-2 font-medium">{playerInfo.team}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Competition:</span>
                  <span className="ml-2 font-medium">{playerInfo.competition}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Matches (Season):</span>
                  <span className="ml-2 font-medium">{totalMatchesSeason}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Season Selection */}
          <div className="mt-6 max-w-xs">
            <Label>Season</Label>
            <Select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              {availableSeasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </Select>
          </div>

          {/* Position Tabs */}
          {seasonPositions.length > 0 && (
            <div className="mt-6">
              <Label className="mb-3 block">Position</Label>
              <div className="flex flex-wrap gap-2">
                {seasonPositions.map(pos => (
                  <button
                    key={pos.positionGroup}
                    onClick={() => setSelectedPositionGroup(pos.positionGroup)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedPositionGroup === pos.positionGroup
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent/10 border-border'
                    }`}
                  >
                    <div className="font-medium">{pos.positionGroup}</div>
                    <div className="text-xs opacity-75 mt-0.5">{pos.matches} matches</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Statistics */}
      {currentStats && (
        <>
          {/* Speed & Distance */}
          <Card>
            <CardHeader>
              <CardTitle>Speed & Distance (per 90 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Peak Speed (99th %ile)</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.psv99)} km/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peak Speed (Top 5)</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.psv99_top5)} km/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.total_distance_full_all_p90, 0)} m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meters per Minute</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.total_metersperminute_full_all_p90)} m/min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Running & High Intensity */}
          <Card>
            <CardHeader>
              <CardTitle>Running & High Intensity (per 90 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Running Distance</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.running_distance_full_all_p90, 0)} m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Intensity Distance</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.hi_distance_full_all_p90, 0)} m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Intensity Count</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.hi_count_full_all_p90)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High Speed Running */}
          <Card>
            <CardHeader>
              <CardTitle>High Speed Running (per 90 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">HSR Distance</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.hsr_distance_full_all_p90, 0)} m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">HSR Count</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.hsr_count_full_all_p90)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time to HSR (Top 3)</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.timetohsr_top3)} s</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expl. Accel to HSR</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.explacceltohsr_count_full_all_p90)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sprints */}
          <Card>
            <CardHeader>
              <CardTitle>Sprints (per 90 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sprint Distance</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.sprint_distance_full_all_p90, 0)} m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sprint Count</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.sprint_count_full_all_p90)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time to Sprint (Top 3)</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.timetosprint_top3)} s</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expl. Accel to Sprint</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.explacceltosprint_count_full_all_p90)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accelerations */}
          <Card>
            <CardHeader>
              <CardTitle>Accelerations (per 90 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Medium Accelerations</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.medaccel_count_full_all_p90)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Accelerations</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.highaccel_count_full_all_p90)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decelerations */}
          <Card>
            <CardHeader>
              <CardTitle>Decelerations (per 90 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Medium Decelerations</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.meddecel_count_full_all_p90)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Decelerations</p>
                  <p className="text-2xl font-bold mt-1">{formatStatValue(currentStats.highdecel_count_full_all_p90)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
