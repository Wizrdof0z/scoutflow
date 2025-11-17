import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store'
import { Player, DataVerdict, VideoscoutingVerdict, LiveScoutingCategory, PositionProfile } from '@/types'
import { getLiveScoutingCategory } from '@/types'
import { getCurrentSeason } from '@/utils/helpers'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import * as supabaseService from '@/lib/supabase-service'

interface PlayerOverviewData {
  player: Player
  overallRating?: number
  dataVerdict?: DataVerdict
  kyleVerdict?: VideoscoutingVerdict
  toerVerdict?: VideoscoutingVerdict
  liveScoutingCategory?: LiveScoutingCategory
  hasReport?: boolean
}

export default function TotalOverviewPage() {
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  const [loading, setLoading] = useState(true)
  const [playerData, setPlayerData] = useState<PlayerOverviewData[]>([])
  
  // Filter states
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<PositionProfile[]>([])
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [contractYearRange, setContractYearRange] = useState<[number, number]>([2024, 2030])
  const [reportFilter, setReportFilter] = useState<'all' | 'with' | 'without'>('all')
  
  // UI states
  const [showCompetitionFilter, setShowCompetitionFilter] = useState(false)
  const [showTeamFilter, setShowTeamFilter] = useState(false)
  const [showPositionFilter, setShowPositionFilter] = useState(false)
  const [showListFilter, setShowListFilter] = useState(false)
  const [showReportFilter, setShowReportFilter] = useState(false)

  // Sorting state
  type SortField = 'name' | 'dob' | 'position' | 'marketValue' | 'contractUntil' | 'overallRating' | 'dataVerdict' | 'kyleVerdict' | 'toerVerdict' | 'liveGrade'
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Load players on mount
  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  // Load all player data with ratings and verdicts
  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true)
      const currentSeason = getCurrentSeason()

      console.log('Loading player data. Players count:', players.length)

      try {
        if (players.length === 0) {
          setPlayerData([])
          setLoading(false)
          return
        }

        // Fetch all data in parallel with batch queries (5 queries total instead of 5 * numPlayers)
        const [ratingsMap, dataEntriesMap, videoEntriesMap, liveEntriesMap, reportCountsMap] = await Promise.all([
          supabaseService.getAllPlayerRatings(currentSeason.seasonID),
          supabaseService.getAllDataScoutingEntries(currentSeason.seasonID),
          supabaseService.getAllVideoscoutingEntries(currentSeason.seasonID),
          supabaseService.getAllLiveScoutingEntries(currentSeason.seasonID),
          supabaseService.getAllPlayerReportCounts(currentSeason.seasonID),
        ])

        console.log('Batch queries complete. Ratings:', ratingsMap.size, 'Data entries:', dataEntriesMap.size)

        // Map data to players (no async calls in loop - pure data transformation)
        const data: PlayerOverviewData[] = players.map(player => {
          const playerInfo: PlayerOverviewData = { player }

          // Get overall rating if available
          const rating = ratingsMap.get(player.playerID)
          if (rating && rating.overall !== undefined && rating.overall !== null) {
            playerInfo.overallRating = rating.overall
          }

          // Get data verdict
          const dataEntry = dataEntriesMap.get(player.playerID)
          if (dataEntry) {
            playerInfo.dataVerdict = dataEntry.dataVerdict
          }

          // Get videoscouting verdicts
          const videoEntry = videoEntriesMap.get(player.playerID)
          if (videoEntry) {
            playerInfo.kyleVerdict = videoEntry.kyleVerdict
            playerInfo.toerVerdict = videoEntry.toerVerdict
          }

          // Get live scouting grade
          const liveEntry = liveEntriesMap.get(player.playerID)
          if (liveEntry && liveEntry.liveScoutingPercentage !== null && liveEntry.liveScoutingPercentage !== undefined) {
            const category = getLiveScoutingCategory(liveEntry.liveScoutingPercentage)
            if (category) {
              playerInfo.liveScoutingCategory = category
            }
          }

          // Check if player has reports
          const reportCount = reportCountsMap.get(player.playerID) || 0
          playerInfo.hasReport = reportCount > 0

          return playerInfo
        })

        console.log('Player data mapped. Total players:', data.length)
        setPlayerData(data)
      } catch (error) {
        console.error('Error loading player data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayerData()
  }, [players])

  // Get unique values for filters
  const competitions = useMemo(() => {
    return Array.from(new Set(players.map((p: Player) => p.currentLeague))).sort()
  }, [players])

  const teams = useMemo(() => {
    return Array.from(new Set(players.map((p: Player) => p.currentTeam))).sort()
  }, [players])

  const positions: PositionProfile[] = [
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

  const listCategories = [
    'Prospects',
    'Datascouting list',
    'Videoscouting list',
    'Live scouting list',
    'Potential list',
    'Not interesting list'
  ]

  // Filter players
  const filteredPlayers = useMemo(() => {
    return playerData.filter(({ player, hasReport }) => {
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

      // List filter
      if (selectedLists.length > 0 && !selectedLists.includes(player.currentList)) {
        return false
      }

      // Report filter
      if (reportFilter === 'with' && !hasReport) {
        return false
      }
      if (reportFilter === 'without' && hasReport) {
        return false
      }

      return true
    })
  }, [playerData, selectedCompetitions, selectedTeams, selectedPositions, selectedLists, contractYearRange, reportFilter])

  // Sorted players
  const sortedPlayers = useMemo(() => {
    console.log('sortedPlayers recalculating. filteredPlayers:', filteredPlayers.length, 'sortField:', sortField)
    
    if (!sortField) return filteredPlayers

    const sorted = [...filteredPlayers].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.player.name.toLowerCase()
          bValue = b.player.name.toLowerCase()
          break
        case 'dob':
          aValue = new Date(a.player.dateOfBirth).getTime()
          bValue = new Date(b.player.dateOfBirth).getTime()
          break
        case 'position':
          aValue = a.player.positionProfile?.toLowerCase() || ''
          bValue = b.player.positionProfile?.toLowerCase() || ''
          break
        case 'marketValue':
          aValue = a.player.marketValue || 0
          bValue = b.player.marketValue || 0
          break
        case 'contractUntil':
          aValue = a.player.contractEndDate ? new Date(a.player.contractEndDate).getTime() : 0
          bValue = b.player.contractEndDate ? new Date(b.player.contractEndDate).getTime() : 0
          break
        case 'overallRating':
          aValue = a.overallRating || 0
          bValue = b.overallRating || 0
          break
        case 'dataVerdict':
          aValue = a.dataVerdict || ''
          bValue = b.dataVerdict || ''
          break
        case 'kyleVerdict':
          aValue = a.kyleVerdict || ''
          bValue = b.kyleVerdict || ''
          break
        case 'toerVerdict':
          aValue = a.toerVerdict || ''
          bValue = b.toerVerdict || ''
          break
        case 'liveGrade':
          aValue = a.liveScoutingCategory || ''
          bValue = b.liveScoutingCategory || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredPlayers, sortField, sortDirection])

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with ascending direction
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline opacity-30" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />
  }

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

  const toggleList = (list: string) => {
    setSelectedLists(prev =>
      prev.includes(list) ? prev.filter(l => l !== list) : [...prev, list]
    )
  }

  const clearAllFilters = () => {
    setSelectedCompetitions([])
    setSelectedTeams([])
    setSelectedPositions([])
    setSelectedLists([])
    setContractYearRange([2024, 2030])
    setReportFilter('all')
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
          Showing {sortedPlayers.length} of {playerData.length} players (Store: {players.length})
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          {(selectedCompetitions.length > 0 || selectedTeams.length > 0 || selectedPositions.length > 0 || selectedLists.length > 0 || reportFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

          {/* List Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">List</label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowListFilter(!showListFilter)}
              >
                <span>
                  {selectedLists.length > 0
                    ? `${selectedLists.length} selected`
                    : 'All lists'}
                </span>
              </Button>
              {showListFilter && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {listCategories.map(list => (
                    <div
                      key={list}
                      className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                      onClick={() => toggleList(list)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLists.includes(list)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="text-sm">{list}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Report Availability Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Report Availability</label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowReportFilter(!showReportFilter)}
              >
                <span>
                  {reportFilter === 'all' && 'All players'}
                  {reportFilter === 'with' && 'With report'}
                  {reportFilter === 'without' && 'Without report'}
                </span>
              </Button>
              {showReportFilter && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                  <div
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setReportFilter('all')
                      setShowReportFilter(false)
                    }}
                  >
                    <span className="text-sm">All players</span>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setReportFilter('with')
                      setShowReportFilter(false)
                    }}
                  >
                    <span className="text-sm">With report</span>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setReportFilter('without')
                      setShowReportFilter(false)
                    }}
                  >
                    <span className="text-sm">Without report</span>
                  </div>
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
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('name')}
                >
                  Name{renderSortIcon('name')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('dob')}
                >
                  Age{renderSortIcon('dob')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('position')}
                >
                  Position{renderSortIcon('position')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('marketValue')}
                >
                  Market Value{renderSortIcon('marketValue')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('contractUntil')}
                >
                  Contract Until{renderSortIcon('contractUntil')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('overallRating')}
                >
                  Overall Rating{renderSortIcon('overallRating')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('dataVerdict')}
                >
                  Data Verdict{renderSortIcon('dataVerdict')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('kyleVerdict')}
                >
                  Kyle Verdict{renderSortIcon('kyleVerdict')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('toerVerdict')}
                >
                  Toer Verdict{renderSortIcon('toerVerdict')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-accent-foreground/5"
                  onClick={() => handleSort('liveGrade')}
                >
                  Live Grade{renderSortIcon('liveGrade')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No players match the selected filters
                  </td>
                </tr>
              ) : (
                sortedPlayers.map(({ player, overallRating, dataVerdict, kyleVerdict, toerVerdict, liveScoutingCategory }) => (
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
                      {calculateAge(player.dateOfBirth)}
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
                      {overallRating !== undefined && overallRating > 0 ? overallRating.toFixed(1) : '-'}
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
