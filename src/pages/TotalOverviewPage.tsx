import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store'
import { Player, DataVerdict, VideoscoutingVerdict, LiveScoutingCategory, PositionProfile } from '@/types'
import { getLiveScoutingCategory } from '@/types'
import { getCurrentSeason } from '@/utils/helpers'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Filter, X } from 'lucide-react'

interface PlayerOverviewData {
  player: Player
  overallRating?: number
  dataVerdict?: DataVerdict
  kyleVerdict?: VideoscoutingVerdict
  toerVerdict?: VideoscoutingVerdict
  liveScoutingCategory?: LiveScoutingCategory
}

export default function TotalOverviewPage() {
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  const getDataScoutingEntry = useAppStore((state) => state.getDataScoutingEntry)
  const getVideoscoutingEntry = useAppStore((state) => state.getVideoscoutingEntry)
  const getLiveScoutingEntry = useAppStore((state) => state.getLiveScoutingEntry)
  const [loading, setLoading] = useState(true)
  const [playerData, setPlayerData] = useState<PlayerOverviewData[]>([])
  
  // Filter states
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<PositionProfile[]>([])
  const [contractYearRange, setContractYearRange] = useState<[number, number]>([2024, 2030])
  
  // UI states
  const [showCompetitionFilter, setShowCompetitionFilter] = useState(false)
  const [showTeamFilter, setShowTeamFilter] = useState(false)
  const [showPositionFilter, setShowPositionFilter] = useState(false)

  // Load players on mount
  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  // Load all player data with ratings and verdicts
  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true)
      const currentSeason = getCurrentSeason()
      const data: PlayerOverviewData[] = []

      for (const player of players) {
        const playerInfo: PlayerOverviewData = { player }

        // Get overall rating if available - get from store
        const rating = await useAppStore.getState().getPlayerRatings(player.playerID, currentSeason.seasonID)
        if (rating) {
          playerInfo.overallRating = rating.overall
        }

        // Get data verdict
        const dataEntry = await getDataScoutingEntry(player.playerID, currentSeason.seasonID)
        if (dataEntry) {
          playerInfo.dataVerdict = dataEntry.dataVerdict
        }

        // Get videoscouting verdict
        const videoEntry = await getVideoscoutingEntry(player.playerID, currentSeason.seasonID)
        if (videoEntry) {
          playerInfo.kyleVerdict = videoEntry.kyleVerdict
          playerInfo.toerVerdict = videoEntry.toerVerdict
        }

        // Get live scouting grade
        const liveEntry = await getLiveScoutingEntry(player.playerID, currentSeason.seasonID)
        if (liveEntry && liveEntry.liveScoutingPercentage !== null && liveEntry.liveScoutingPercentage !== undefined) {
          const category = getLiveScoutingCategory(liveEntry.liveScoutingPercentage)
          if (category) {
            playerInfo.liveScoutingCategory = category
          }
        }

        data.push(playerInfo)
      }

      setPlayerData(data)
      setLoading(false)
    }

    loadPlayerData()
  }, [players, getDataScoutingEntry, getVideoscoutingEntry, getLiveScoutingEntry])

  // Get unique values for filters
  const competitions = useMemo(() => {
    return Array.from(new Set(players.map((p: Player) => p.currentLeague))).sort()
  }, [players])

  const teams = useMemo(() => {
    return Array.from(new Set(players.map((p: Player) => p.currentTeam))).sort()
  }, [players])

  const positions: PositionProfile[] = [
    'Goalkeeper',
    'Centre-Back',
    'Full-Back',
    'Defensive Midfielder',
    'Central Midfielder',
    'Attacking Midfielder',
    'Winger',
    'Striker'
  ]

  // Filter players
  const filteredPlayers = useMemo(() => {
    return playerData.filter(({ player }) => {
      // Competition filter
      if (selectedCompetitions.length > 0 && !selectedCompetitions.includes(player.currentLeague)) {
        return false
      }

      // Team filter
      if (selectedTeams.length > 0 && !selectedTeams.includes(player.currentTeam)) {
        return false
      }

      // Position filter
      if (selectedPositions.length > 0 && player.positionProfile) {
        if (!selectedPositions.includes(player.positionProfile)) {
          return false
        }
      } else if (selectedPositions.length > 0 && !player.positionProfile) {
        return false
      }

      // Contract year filter
      if (player.contractEndDate) {
        const contractYear = new Date(player.contractEndDate).getFullYear()
        if (contractYear < contractYearRange[0] || contractYear > contractYearRange[1]) {
          return false
        }
      }

      return true
    })
  }, [playerData, selectedCompetitions, selectedTeams, selectedPositions, contractYearRange])

  // Toggle filter selection
  const toggleCompetition = (comp: string) => {
    setSelectedCompetitions(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    )
  }

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    )
  }

  const togglePosition = (pos: PositionProfile) => {
    setSelectedPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    )
  }

  const clearAllFilters = () => {
    setSelectedCompetitions([])
    setSelectedTeams([])
    setSelectedPositions([])
    setContractYearRange([2024, 2030])
  }

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getVerdictColor = (verdict?: DataVerdict | VideoscoutingVerdict | LiveScoutingCategory): string => {
    if (!verdict) return 'bg-gray-100 text-gray-700'
    
    if (verdict === 'Good' || verdict === 'Follow-up') return 'bg-green-100 text-green-700'
    if (verdict === 'Average' || verdict === 'Continue Monitoring') return 'bg-orange-100 text-orange-700'
    if (verdict === 'Bad' || verdict === 'Not Good Enough') return 'bg-red-100 text-red-700'
    
    // Live scouting categories
    if (verdict.includes('Top') || verdict.includes('Subtop') || verdict.includes('Heracles')) {
      return 'bg-green-100 text-green-700'
    }
    if (verdict.includes('Bottom Eredivisie') || verdict.includes('KKD Subtop')) {
      return 'bg-orange-100 text-orange-700'
    }
    if (verdict.includes('KKD Mid-Table') || verdict.includes('KKD Bottom')) {
      return 'bg-red-100 text-red-700'
    }
    
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Total Overview</h1>
        <div className="text-sm text-muted-foreground">
          Showing {filteredPlayers.length} of {playerData.length} players
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          {(selectedCompetitions.length > 0 || selectedTeams.length > 0 || selectedPositions.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Competition Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Competition</label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowCompetitionFilter(!showCompetitionFilter)}
              >
                <span>
                  {selectedCompetitions.length > 0
                    ? `${selectedCompetitions.length} selected`
                    : 'All competitions'}
                </span>
              </Button>
              {showCompetitionFilter && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {competitions.map((comp: string) => (
                    <div
                      key={comp}
                      className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                      onClick={() => toggleCompetition(comp)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompetitions.includes(comp)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="text-sm">{comp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Team</label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowTeamFilter(!showTeamFilter)}
              >
                <span>
                  {selectedTeams.length > 0
                    ? `${selectedTeams.length} selected`
                    : 'All teams'}
                </span>
              </Button>
              {showTeamFilter && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {teams.map((team: string) => (
                    <div
                      key={team}
                      className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                      onClick={() => toggleTeam(team)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="text-sm">{team}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Position Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowPositionFilter(!showPositionFilter)}
              >
                <span>
                  {selectedPositions.length > 0
                    ? `${selectedPositions.length} selected`
                    : 'All positions'}
                </span>
              </Button>
              {showPositionFilter && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {positions.map(pos => (
                    <div
                      key={pos}
                      className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                      onClick={() => togglePosition(pos)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPositions.includes(pos)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="text-sm">{pos}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contract Year Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contract Until: {contractYearRange[0]} - {contractYearRange[1]}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="2024"
                max="2030"
                value={contractYearRange[0]}
                onChange={(e) => setContractYearRange([parseInt(e.target.value), contractYearRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="2024"
                max="2030"
                value={contractYearRange[1]}
                onChange={(e) => setContractYearRange([contractYearRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Players Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">DoB</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Position</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Market Value</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Contract Until</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Overall Rating</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Data Verdict</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Kyle Verdict</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Toer Verdict</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Live Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No players match the selected filters
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(({ player, overallRating, dataVerdict, kyleVerdict, toerVerdict, liveScoutingCategory }) => (
                  <tr key={player.playerID} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/player/${player.playerID}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(player.dateOfBirth).toLocaleDateString()} ({calculateAge(player.dateOfBirth)}y)
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {player.positionProfile || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {player.marketValue
                        ? `€${player.marketValue.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {player.contractEndDate
                        ? new Date(player.contractEndDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {overallRating !== undefined ? overallRating.toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {dataVerdict ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(dataVerdict)}`}>
                          {dataVerdict}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {kyleVerdict ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(kyleVerdict)}`}>
                          {kyleVerdict}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {toerVerdict ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(toerVerdict)}`}>
                          {toerVerdict}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {liveScoutingCategory ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(liveScoutingCategory)}`}>
                          {liveScoutingCategory}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
