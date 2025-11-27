import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { calculateAge } from '@/utils/helpers'
import * as supabaseService from '@/lib/supabase-service'

interface PlayerRatings {
  player_id: number
  player_name: string
  short_name?: string
  position: string
  position_group: string
  team_name: string
  team_id: number
  competition_name: string
  competition_edition_id: number
  season_name: string
  season_id?: number
  count_match: number
  date_of_birth?: string
  age?: number
  // Dynamic category ratings (0-100, 2 decimals)
  [key: string]: any
}

type Position = 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'CF'

const POSITIONS: Position[] = ['CF', 'LW', 'RW', 'AM', 'CM', 'DM', 'LB', 'RB', 'CB']

// Position to display name mapping
const POSITION_NAMES: Record<Position, string> = {
  'CF': 'Centre Forward',
  'LW': 'Left Winger',
  'RW': 'Right Winger',
  'AM': 'Attacking Midfielder',
  'CM': 'Central Midfielder',
  'DM': 'Defensive Midfielder',
  'LB': 'Left Fullback',
  'RB': 'Right Fullback',
  'CB': 'Centre Back'
}

export default function SkillCornerViewsPage() {
  const [selectedPosition, setSelectedPosition] = useState<Position>('CF')
  const [players, setPlayers] = useState<PlayerRatings[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [ageRange, setAgeRange] = useState<[number, number]>([16, 40])
  const [matchesRange, setMatchesRange] = useState<[number, number]>([5, 50])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  
  // Dropdown open states
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false)
  const [competitionDropdownOpen, setCompetitionDropdownOpen] = useState(false)
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSeasonDropdownOpen(false)
      setCompetitionDropdownOpen(false)
      setTeamDropdownOpen(false)
    }
    
    if (seasonDropdownOpen || competitionDropdownOpen || teamDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [seasonDropdownOpen, competitionDropdownOpen, teamDropdownOpen])

  // Fetch data when position changes
  useEffect(() => {
    fetchPlayers()
  }, [selectedPosition])

  const fetchPlayers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await supabaseService.getSkillCornerStatsByPosition(selectedPosition)
      
      // Calculate age for each player
      const playersWithAge = data.map((player: any) => ({
        ...player,
        age: player.date_of_birth ? calculateAge(player.date_of_birth) : null
      }))
      
      setPlayers(playersWithAge)
    } catch (err: any) {
      console.error('Error fetching players:', err)
      setError(err.message || 'Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  // Get unique values for filters
  const availableSeasons = useMemo(() => {
    const seasons = Array.from(new Set(players.map(p => p.season_name))).filter(Boolean).sort()
    return seasons as string[]
  }, [players])

  const availableCompetitions = useMemo(() => {
    const competitions = Array.from(new Set(players.map(p => p.competition_name))).filter(Boolean).sort()
    return competitions as string[]
  }, [players])

  const availableTeams = useMemo(() => {
    const teams = Array.from(new Set(players.map(p => p.team_name))).filter(Boolean).sort()
    return teams as string[]
  }, [players])

  // Filter by search query and all filters
  const filteredPlayers = useMemo(() => {
    let filtered = players

    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p: PlayerRatings) =>
          p.player_name?.toLowerCase().includes(query) ||
          p.team_name?.toLowerCase().includes(query) ||
          p.competition_name?.toLowerCase().includes(query)
      )
    }

    // Age filter
    filtered = filtered.filter(p => {
      if (!p.age) return true // Include players without age data
      return p.age >= ageRange[0] && p.age <= ageRange[1]
    })

    // Matches played filter
    filtered = filtered.filter(p => p.count_match >= matchesRange[0] && p.count_match <= matchesRange[1])

    // Season filter
    if (selectedSeasons.length > 0) {
      filtered = filtered.filter(p => selectedSeasons.includes(p.season_name))
    }

    // Competition filter
    if (selectedCompetitions.length > 0) {
      filtered = filtered.filter(p => selectedCompetitions.includes(p.competition_name))
    }

    // Team filter
    if (selectedTeams.length > 0) {
      filtered = filtered.filter(p => selectedTeams.includes(p.team_name))
    }

    return filtered
  }, [players, searchQuery, ageRange, matchesRange, selectedSeasons, selectedCompetitions, selectedTeams])

  // Extract category rating columns (exclude metadata fields)
  const ratingColumns = useMemo(() => {
    if (filteredPlayers.length === 0) return []
    
    const excludeFields = [
      'player_id',
      'player_name',
      'short_name',
      'position',
      'team_name',
      'team_id',
      'competition_name',
      'competition_edition_id',
      'season_name',
      'season_id',
      'position_group',
      'count_match',
      'date_of_birth',
      'player_birthdate',
      'age'
    ]
    
    const allKeys = new Set<string>()
    filteredPlayers.forEach((player) => {
      Object.keys(player).forEach((key) => {
        if (!excludeFields.includes(key) && player[key] !== null && player[key] !== undefined) {
          allKeys.add(key)
        }
      })
    })
    
    return Array.from(allKeys).sort()
  }, [filteredPlayers])

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') return value.toFixed(2)
    return value.toString()
  }

  // Format column name for display
  const formatColumnName = (col: string) => {
    return col
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Get color coding for rating value
  const getRatingColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'text-gray-400'
    if (value >= 80) return 'text-green-700 font-semibold'
    if (value >= 60) return 'text-green-600'
    if (value >= 40) return 'text-yellow-600'
    if (value >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-full">
      <h1 className="text-3xl font-bold mb-2">SkillCorner Player Ratings</h1>
      <p className="text-gray-600 mb-6">
        Position-specific percentile-based ratings (0-100 scale) across key performance categories
      </p>

      <Card className="mb-6 p-6">
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block font-semibold">Position</Label>
            <div className="flex gap-2 flex-wrap">
              {POSITIONS.map((pos) => (
                <Button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  variant={selectedPosition === pos ? 'default' : 'outline'}
                  size="sm"
                >
                  {pos}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">
                Search Players
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name, team, competition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Label className="mb-2 block">Season</Label>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSeasonDropdownOpen(!seasonDropdownOpen)
                }}
                className="flex h-10 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 justify-between items-center transition-colors"
              >
                <span className="truncate">
                  {selectedSeasons.length === 0 ? 'All Seasons' : 
                   selectedSeasons.length === 1 ? selectedSeasons[0] :
                   `${selectedSeasons.length} seasons selected`}
                </span>
                <span className="ml-2 text-gray-500">▼</span>
              </button>
              {seasonDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border-2 border-gray-300 bg-white shadow-xl"
                >
                  <div className="p-2">
                    <label className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSeasons.length === 0}
                        onChange={() => setSelectedSeasons([])}
                        className="mr-2"
                      />
                      <span className="text-sm">All Seasons</span>
                    </label>
                    {availableSeasons.map(season => (
                      <label key={season} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSeasons.includes(season)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSeasons([...selectedSeasons, season])
                            } else {
                              setSelectedSeasons(selectedSeasons.filter(s => s !== season))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{season}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Label className="mb-2 block">Competition</Label>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setCompetitionDropdownOpen(!competitionDropdownOpen)
                }}
                className="flex h-10 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 justify-between items-center transition-colors"
              >
                <span className="truncate">
                  {selectedCompetitions.length === 0 ? 'All Competitions' : 
                   selectedCompetitions.length === 1 ? selectedCompetitions[0] :
                   `${selectedCompetitions.length} competitions selected`}
                </span>
                <span className="ml-2 text-gray-500">▼</span>
              </button>
              {competitionDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border-2 border-gray-300 bg-white shadow-xl"
                >
                  <div className="p-2">
                    <label className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCompetitions.length === 0}
                        onChange={() => setSelectedCompetitions([])}
                        className="mr-2"
                      />
                      <span className="text-sm">All Competitions</span>
                    </label>
                    {availableCompetitions.map(comp => (
                      <label key={comp} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCompetitions.includes(comp)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompetitions([...selectedCompetitions, comp])
                            } else {
                              setSelectedCompetitions(selectedCompetitions.filter(c => c !== comp))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{comp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Label className="mb-2 block">Team</Label>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setTeamDropdownOpen(!teamDropdownOpen)
                }}
                className="flex h-10 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 justify-between items-center transition-colors"
              >
                <span className="truncate">
                  {selectedTeams.length === 0 ? 'All Teams' : 
                   selectedTeams.length === 1 ? selectedTeams[0] :
                   `${selectedTeams.length} teams selected`}
                </span>
                <span className="ml-2 text-gray-500">▼</span>
              </button>
              {teamDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border-2 border-gray-300 bg-white shadow-xl"
                >
                  <div className="p-2">
                    <label className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTeams.length === 0}
                        onChange={() => setSelectedTeams([])}
                        className="mr-2"
                      />
                      <span className="text-sm">All Teams</span>
                    </label>
                    {availableTeams.map(team => (
                      <label key={team} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeams([...selectedTeams, team])
                            } else {
                              setSelectedTeams(selectedTeams.filter(t => t !== team))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{team}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2 block">
                Age Range: {ageRange[0]} - {ageRange[1]}
              </Label>
              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="16"
                    max="40"
                    value={ageRange[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (val <= ageRange[1]) setAgeRange([val, ageRange[1]])
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min="16"
                      max="40"
                      value={ageRange[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val <= ageRange[1]) setAgeRange([val, ageRange[1]])
                      }}
                      className="absolute w-full"
                      style={{ zIndex: ageRange[0] > 20 ? 2 : 1 }}
                    />
                    <input
                      type="range"
                      min="16"
                      max="40"
                      value={ageRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val >= ageRange[0]) setAgeRange([ageRange[0], val])
                      }}
                      className="absolute w-full"
                      style={{ zIndex: 1 }}
                    />
                  </div>
                  <input
                    type="number"
                    min="16"
                    max="40"
                    value={ageRange[1]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (val >= ageRange[0]) setAgeRange([ageRange[0], val])
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                Min Matches: {matchesRange[0]} - {matchesRange[1]}
              </Label>
              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={matchesRange[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (val <= matchesRange[1]) setMatchesRange([val, matchesRange[1]])
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={matchesRange[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val <= matchesRange[1]) setMatchesRange([val, matchesRange[1]])
                      }}
                      className="absolute w-full"
                      style={{ zIndex: matchesRange[0] > 25 ? 2 : 1 }}
                    />
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={matchesRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val >= matchesRange[0]) setMatchesRange([matchesRange[0], val])
                      }}
                      className="absolute w-full"
                      style={{ zIndex: 1 }}
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={matchesRange[1]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (val >= matchesRange[0]) setMatchesRange([matchesRange[0], val])
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {(selectedSeasons.length > 0 || selectedCompetitions.length > 0 || selectedTeams.length > 0) && (
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedSeasons.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSeasons([])}
                >
                  Seasons ({selectedSeasons.length}) ✕
                </Button>
              )}
              {selectedCompetitions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCompetitions([])}
                >
                  Competitions ({selectedCompetitions.length}) ✕
                </Button>
              )}
              {selectedTeams.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeams([])}
                >
                  Teams ({selectedTeams.length}) ✕
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {POSITION_NAMES[selectedPosition]} - {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
          </h2>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading player ratings...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No players found {searchQuery ? 'matching your search' : 'for this position'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300 min-w-[180px]">
                    Player
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase min-w-[50px]">
                    Age
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase min-w-[150px]">
                    Team
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase min-w-[120px]">
                    Competition
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase min-w-[80px]">
                    Season
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase min-w-[50px]">
                    MP
                  </th>
                  
                  {ratingColumns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase bg-blue-50 min-w-[100px]"
                      title={formatColumnName(col)}
                    >
                      {formatColumnName(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player, idx) => (
                  <tr key={`${player.player_id}-${idx}`} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-gray-900 border-r border-gray-200 min-w-[180px]" title={player.player_name}>
                      {player.player_name}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 min-w-[50px]">
                      {player.age || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 min-w-[150px]" title={player.team_name}>
                      {player.team_name}
                    </td>
                    <td className="px-3 py-2 text-gray-700 min-w-[120px]" title={player.competition_name}>
                      {player.competition_name}
                    </td>
                    <td className="px-3 py-2 text-gray-700 min-w-[80px]" title={player.season_name}>
                      {player.season_name}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 min-w-[50px]">
                      {player.count_match}
                    </td>
                    
                    {ratingColumns.map((col) => {
                      const value = player[col]
                      return (
                        <td
                          key={col}
                          className={`px-3 py-2 text-center font-semibold min-w-[100px] ${getRatingColor(value)}`}
                        >
                          {formatValue(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredPlayers.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} with {ratingColumns.length} rating categor{ratingColumns.length !== 1 ? 'ies' : 'y'}
          </div>
        )}
      </Card>
    </div>
  )
}
