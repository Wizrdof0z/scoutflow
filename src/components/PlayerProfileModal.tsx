import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase'
import { calculateAge, formatStatValue, normalizePosition } from '@/utils/position-helpers'

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
  position: string
  matches: number
  data: PhysicalData
}

interface PlayerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  playerId: number | null
}

export default function PlayerProfileModal({ isOpen, onClose, playerId }: PlayerProfileModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [physicalData, setPhysicalData] = useState<PhysicalData[]>([])
  
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedPositionGroup, setSelectedPositionGroup] = useState<string>('')
  
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([])
  const [positionsBySeasonAndGroup, setPositionsBySeasonAndGroup] = useState<Map<string, PositionData[]>>(new Map())

  useEffect(() => {
    if (isOpen && playerId) {
      fetchPhysicalDataFromDatabase()
    } else {
      // Reset when closed
      setPhysicalData([])
      setError(null)
      setLoading(true)
    }
  }, [isOpen, playerId])

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
      setSelectedPositionGroup(topPosition.position)
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
    
    // Group data by season and normalized position
    const grouped = new Map<string, PositionData[]>()
    
    seasons.forEach(season => {
      const seasonData = physicalData.filter(d => d.season_name === season)
      
      // Group by normalized position and sum matches
      const positionMap = new Map<string, { matches: number, bestData: PhysicalData }>()
      
      seasonData.forEach(data => {
        const normalizedPos = normalizePosition(data.position)
        const current = positionMap.get(normalizedPos)
        
        if (!current) {
          positionMap.set(normalizedPos, {
            matches: data.count_match,
            bestData: data
          })
        } else {
          // Sum matches and keep the data with most matches
          positionMap.set(normalizedPos, {
            matches: current.matches + data.count_match,
            bestData: data.count_match > current.bestData.count_match ? data : current.bestData
          })
        }
      })
      
      // Convert to array
      const positionData: PositionData[] = Array.from(positionMap.entries()).map(([position, info]) => ({
        position: position,
        matches: info.matches,
        data: info.bestData
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
    const positionData = positions.find(p => p.position === selectedPositionGroup)
    
    if (!positionData) return null
    
    return positionData.data
  }

  const playerInfo = getPlayerInfo()
  const currentStats = getCurrentStats()
  const seasonPositions = selectedSeason && positionsBySeasonAndGroup.has(selectedSeason) 
    ? positionsBySeasonAndGroup.get(selectedSeason)! 
    : []

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <DialogHeader onClose={onClose}>
        {loading ? (
          <DialogTitle>Loading...</DialogTitle>
        ) : playerInfo ? (
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle>{playerInfo.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{playerInfo.shortName}</p>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{playerInfo.team}</div>
              <div className="text-muted-foreground">{playerInfo.competition}</div>
              <div className="text-muted-foreground mt-1">Age: {playerInfo.age ?? 'N/A'}</div>
            </div>
          </div>
        ) : (
          <DialogTitle>Player Profile</DialogTitle>
        )}
      </DialogHeader>

      <DialogContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading player data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 font-medium mb-2">Error loading player data</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          </div>
        ) : !playerInfo ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No player data found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Season and Position Selection */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
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
              
              {seasonPositions.length > 0 && (
                <div className="flex-1">
                  <Label>Position</Label>
                  <Select
                    value={selectedPositionGroup}
                    onChange={(e) => setSelectedPositionGroup(e.target.value)}
                  >
                    {seasonPositions.map(pos => (
                      <option key={pos.position} value={pos.position}>
                        {pos.position} ({pos.matches} matches)
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            {/* Physical Statistics */}
            {currentStats && (
              <div className="space-y-3">
                {/* Speed & Distance */}
                <div className="border border-border rounded-lg p-3">
                  <h3 className="text-sm font-semibold mb-2">Speed & Distance</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <StatItem label="Peak Speed (99%)" value={formatStatValue(currentStats.psv99)} unit="km/h" />
                    <StatItem label="Peak Speed (Top 5)" value={formatStatValue(currentStats.psv99_top5)} unit="km/h" />
                    <StatItem label="Total Distance" value={formatStatValue(currentStats.total_distance_full_all_p90, 0)} unit="m" />
                    <StatItem label="Meters/Min" value={formatStatValue(currentStats.total_metersperminute_full_all_p90)} unit="m/min" />
                  </div>
                </div>

                {/* Running & HI */}
                <div className="border border-border rounded-lg p-3">
                  <h3 className="text-sm font-semibold mb-2">Running & High Intensity</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <StatItem label="Running Distance" value={formatStatValue(currentStats.running_distance_full_all_p90, 0)} unit="m" />
                    <StatItem label="HI Distance" value={formatStatValue(currentStats.hi_distance_full_all_p90, 0)} unit="m" />
                    <StatItem label="HI Count" value={formatStatValue(currentStats.hi_count_full_all_p90)} />
                  </div>
                </div>

                {/* HSR */}
                <div className="border border-border rounded-lg p-3">
                  <h3 className="text-sm font-semibold mb-2">High Speed Running</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <StatItem label="HSR Distance" value={formatStatValue(currentStats.hsr_distance_full_all_p90, 0)} unit="m" />
                    <StatItem label="HSR Count" value={formatStatValue(currentStats.hsr_count_full_all_p90)} />
                    <StatItem label="Time to HSR" value={formatStatValue(currentStats.timetohsr_top3)} unit="s" />
                    <StatItem label="Expl. Accel to HSR" value={formatStatValue(currentStats.explacceltohsr_count_full_all_p90)} />
                  </div>
                </div>

                {/* Sprints */}
                <div className="border border-border rounded-lg p-3">
                  <h3 className="text-sm font-semibold mb-2">Sprints</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <StatItem label="Sprint Distance" value={formatStatValue(currentStats.sprint_distance_full_all_p90, 0)} unit="m" />
                    <StatItem label="Sprint Count" value={formatStatValue(currentStats.sprint_count_full_all_p90)} />
                    <StatItem label="Time to Sprint" value={formatStatValue(currentStats.timetosprint_top3)} unit="s" />
                    <StatItem label="Expl. Accel to Sprint" value={formatStatValue(currentStats.explacceltosprint_count_full_all_p90)} />
                  </div>
                </div>

                {/* Accelerations & Decelerations */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-border rounded-lg p-3">
                    <h3 className="text-sm font-semibold mb-2">Accelerations</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StatItem label="Medium" value={formatStatValue(currentStats.medaccel_count_full_all_p90)} />
                      <StatItem label="High" value={formatStatValue(currentStats.highaccel_count_full_all_p90)} />
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-3">
                    <h3 className="text-sm font-semibold mb-2">Decelerations</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StatItem label="Medium" value={formatStatValue(currentStats.meddecel_count_full_all_p90)} />
                      <StatItem label="High" value={formatStatValue(currentStats.highdecel_count_full_all_p90)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Compact stat item component
function StatItem({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  )
}
