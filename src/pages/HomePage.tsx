import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store'
import { useAuthStore } from '@/store'
import { getCurrentSeason, calculateAge } from '@/utils/helpers'
import type { Player } from '@/types'

// Component to fetch and display subprofile
function SubprofileDisplay({ playerID }: { playerID: string }) {
  const [subProfile, setSubProfile] = useState<string | null>(null)
  const getDataScoutingEntry = useAppStore((state) => state.getDataScoutingEntry)
  
  useEffect(() => {
    async function fetchSubProfile() {
      try {
        const currentSeason = getCurrentSeason()
        const entry = await getDataScoutingEntry(playerID, currentSeason.seasonID)
        setSubProfile(entry?.subProfile || null)
      } catch (e) {
        setSubProfile(null)
      }
    }
    fetchSubProfile()
  }, [playerID, getDataScoutingEntry])
  
  return <>{subProfile || 'TBD'}</>
}

export default function HomePage() {
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  const user = useAuthStore((state) => state.user)
  const updatePlayer = useAppStore((state) => state.updatePlayer)
  const getVideoscoutingEntry = useAppStore((state) => state.getVideoscoutingEntry)
  const getPlayerReports = useAppStore((state) => state.getPlayerReports)
  
  const [prospects, setProspects] = useState(0)
  const [datascouting, setDatascouting] = useState(0)
  const [videoscouting, setVideoscouting] = useState(0)
  const [livescouting, setLivescouting] = useState(0)
  const [potential, setPotential] = useState(0)
  const [notInteresting, setNotInteresting] = useState(0)
  
  // Videoscout-specific tiles
  const [dataReportsCount, setDataReportsCount] = useState(0)
  const [recentlyVideoscoutedCount, setRecentlyVideoscoutedCount] = useState(0)
  
  // Cache for videoscout-specific data
  const [playersWithReports, setPlayersWithReports] = useState<Set<string>>(new Set())
  const [recentlyVideoscoutedPlayers, setRecentlyVideoscoutedPlayers] = useState<Set<string>>(new Set())
  
  // Sidebar state
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  
  // State for videoscout-specific data
  const [videoscoutingData, setVideoscoutingData] = useState<Map<string, { 
    kyleVerdict: string | null, 
    toerVerdict: string | null,
    dataVerdict: string | null 
  }>>(new Map())
  
  // Load players on mount
  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])
  
  // Count players by list
  useEffect(() => {
    if (players.length > 0) {
      setProspects(players.filter(p => p.currentList === 'Prospects').length)
      setDatascouting(players.filter(p => p.currentList === 'Datascouting list').length)
      setVideoscouting(players.filter(p => p.currentList === 'Videoscouting list').length)
      setLivescouting(players.filter(p => p.currentList === 'Live scouting list').length)
      setPotential(players.filter(p => p.currentList === 'Potential list').length)
      setNotInteresting(players.filter(p => p.currentList === 'Not interesting list').length)
    }
  }, [players])
  
  // Count videoscout-specific tiles
  useEffect(() => {
    if (user?.role === 'videoscout' && players.length > 0) {
      const currentSeason = getCurrentSeason()
      
      // Fetch all data in parallel for better performance
      const fetchVideoscoutData = async () => {
        const reportsSet = new Set<string>()
        const videoscoutedSet = new Set<string>()
        
        // Use Promise.all to fetch data for all players in parallel
        const results = await Promise.all(
          players.map(async (player) => {
            const [reports, videoEntry] = await Promise.all([
              getPlayerReports(player.playerID, currentSeason.seasonID),
              getVideoscoutingEntry(player.playerID, currentSeason.seasonID)
            ])
            
            return {
              playerID: player.playerID,
              hasReports: reports && reports.length > 0,
              hasMyVerdict: user.email === 'kyle' ? !!videoEntry?.kyleVerdict : 
                           user.email === 'toer' ? !!videoEntry?.toerVerdict : false
            }
          })
        )
        
        // Process results
        results.forEach(result => {
          if (result.hasReports) reportsSet.add(result.playerID)
          if (result.hasMyVerdict) videoscoutedSet.add(result.playerID)
        })
        
        // Update state
        setPlayersWithReports(reportsSet)
        setRecentlyVideoscoutedPlayers(videoscoutedSet)
        setDataReportsCount(reportsSet.size)
        setRecentlyVideoscoutedCount(videoscoutedSet.size)
      }
      
      fetchVideoscoutData()
    }
  }, [players, user, getPlayerReports, getVideoscoutingEntry])
  
  // Load videoscouting verdicts for relevant views
  useEffect(() => {
    if ((user?.role === 'datascout' || user?.role === 'videoscout') && players.length > 0) {
      const currentSeason = getCurrentSeason()
      const fetchVerdicts = async () => {
        const verdictMap = new Map()
        
        // Load verdicts for ALL players for both videoscouts and datascouts
        // This ensures verdicts show in all tile sidebars
        const relevantPlayers = players
        
        // Fetch all verdicts in parallel for better performance
        const results = await Promise.all(
          relevantPlayers.map(async (player) => {
            try {
              const [videoscoutEntry, datascoutEntry] = await Promise.all([
                getVideoscoutingEntry(player.playerID, currentSeason.seasonID),
                useAppStore.getState().getDataScoutingEntry(player.playerID, currentSeason.seasonID)
              ])
              return {
                playerID: player.playerID,
                kyleVerdict: videoscoutEntry?.kyleVerdict || null,
                toerVerdict: videoscoutEntry?.toerVerdict || null,
                dataVerdict: datascoutEntry?.dataVerdict || null
              }
            } catch (e) {
              return {
                playerID: player.playerID,
                kyleVerdict: null,
                toerVerdict: null,
                dataVerdict: null
              }
            }
          })
        )
        
        // Build the verdict map
        results.forEach(result => {
          verdictMap.set(result.playerID, {
            kyleVerdict: result.kyleVerdict,
            toerVerdict: result.toerVerdict,
            dataVerdict: result.dataVerdict
          })
        })
        
        setVideoscoutingData(verdictMap)
      }
      fetchVerdicts()
    }
  }, [players, user, getVideoscoutingEntry])
  
  // Filter players when a list is selected
  useEffect(() => {
    if (selectedList && players.length > 0) {
      if (selectedList === 'Data Reports') {
        // Use cached data for instant filtering
        const filtered = players.filter(p => playersWithReports.has(p.playerID))
        setFilteredPlayers(filtered)
      } else if (selectedList === 'Recently Videoscouted') {
        // Use cached data for instant filtering
        const filtered = players.filter(p => recentlyVideoscoutedPlayers.has(p.playerID))
        setFilteredPlayers(filtered)
      } else {
        // Default list filtering
        const filtered = players.filter(p => p.currentList === selectedList)
        setFilteredPlayers(filtered)
      }
    } else {
      setFilteredPlayers([])
    }
  }, [selectedList, players, playersWithReports, recentlyVideoscoutedPlayers])
  
  const handleTileClick = (listName: string) => {
    if (selectedList === listName) {
      setSelectedList(null)
    } else {
      setSelectedList(listName)
    }
  }
  
  const handleListChange = async (playerID: string, newList: string) => {
    try {
      await updatePlayer(playerID, { currentList: newList as any })
      await loadPlayers() // Reload to update counts
    } catch (error) {
      console.error('Failed to update player list:', error)
    }
  }
  
  // Get recently added players (last 5) - for admin
  const recentPlayers = [...players].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5)
  
  // Get players with completed verdicts - for datascout
  const completedVerdictPlayers = players
    .filter(p => p.currentList === 'Videoscouting list')
    .filter(player => {
      const verdicts = videoscoutingData.get(player.playerID)
      return verdicts?.kyleVerdict && verdicts?.toerVerdict
    })
  
  // Get videoscouting list players (excluding completed verdicts) - for datascout
  const videoscoutingPlayers = players
    .filter(p => p.currentList === 'Videoscouting list')
    .filter(player => {
      const verdicts = videoscoutingData.get(player.playerID)
      return !(verdicts?.kyleVerdict && verdicts?.toerVerdict)
    })
  
  // Get players without current user's verdict - for videoscout
  const playersWithoutMyVerdict = players
    .filter(p => p.currentList === 'Videoscouting list')
    .filter(player => {
    const verdicts = videoscoutingData.get(player.playerID)
    if (user?.email === 'kyle') {
      return !verdicts?.kyleVerdict
    } else if (user?.email === 'toer') {
      return !verdicts?.toerVerdict
    }
    return false
  })
  
  // Get live scouting list players - for livescout
  const livescoutingPlayers = players.filter(p => p.currentList === 'Live scouting list')

  return (
    <>
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-semibold tracking-tight">
          Welcome to ScoutFlow
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className={`space-y-8 transition-all duration-300 ${selectedList ? 'w-2/3' : 'w-full'}`}>
          {/* Quick Stats - Conditional rendering based on user role */}
          {user?.role === 'videoscout' ? (
            // Videoscout tiles: Data Reports, Videoscouting, Recently Videoscouted
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Data Reports' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleTileClick('Data Reports')}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Data Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{dataReportsCount}</div>
                  <p className="text-sm text-muted-foreground mt-2">Players with data reports</p>
                </CardContent>
              </Card>

              <Card 
                className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Videoscouting list' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleTileClick('Videoscouting list')}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Video Scouting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-followup">{videoscouting}</div>
                  <p className="text-sm text-muted-foreground mt-2">For video review</p>
                </CardContent>
              </Card>

              <Card 
                className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Recently Videoscouted' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleTileClick('Recently Videoscouted')}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Recently Videoscouted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-discuss">{recentlyVideoscoutedCount}</div>
                  <p className="text-sm text-muted-foreground mt-2">Your recent verdicts</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Default tiles for all other roles
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Prospects' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleTileClick('Prospects')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Prospects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">{prospects}</div>
                    <p className="text-sm text-muted-foreground mt-2">New players to review</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Datascouting list' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleTileClick('Datascouting list')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Data Scouting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-accent-foreground">{datascouting}</div>
                    <p className="text-sm text-muted-foreground mt-2">For data analysis</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Videoscouting list' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleTileClick('Videoscouting list')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Video Scouting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-followup">{videoscouting}</div>
                    <p className="text-sm text-muted-foreground mt-2">For video review</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Live scouting list' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleTileClick('Live scouting list')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Live Scouting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-monitoring">{livescouting}</div>
                    <p className="text-sm text-muted-foreground mt-2">To watch live</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Potential list' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleTileClick('Potential list')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-discuss">{potential}</div>
                    <p className="text-sm text-muted-foreground mt-2">High potential players</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`hover:bg-accent/10 transition-calm hover-lift cursor-pointer ${selectedList === 'Not interesting list' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleTileClick('Not interesting list')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Not Interesting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-notgood">{notInteresting}</div>
                    <p className="text-sm text-muted-foreground mt-2">Archived players</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Role-Specific Content */}
          
          {/* Admin: Recently Added Players */}
          {user?.role === 'admin' && recentPlayers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPlayers.map((player) => (
                    <Link
                      key={player.playerID}
                      to={`/player/${player.playerID}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/10 transition-calm hover-lift">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.currentTeam} • {player.positionProfile || 'Position TBD'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Added: {player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Datascout: Videoscouting List Overview */}
          {user?.role === 'datascout' && (
            <>
              {/* Players with Completed Verdicts */}
              {completedVerdictPlayers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Videoscouting Verdicts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr className="text-left">
                            <th className="pb-3 font-medium">Name</th>
                            <th className="pb-3 font-medium">Position</th>
                            <th className="pb-3 font-medium">Age</th>
                            <th className="pb-3 font-medium">Team</th>
                            <th className="pb-3 font-medium">League</th>
                            <th className="pb-3 font-medium">Datascouting Verdict</th>
                            <th className="pb-3 font-medium">Verdict Kyle</th>
                            <th className="pb-3 font-medium">Verdict Toer</th>
                            <th className="pb-3 font-medium">Data Available</th>
                            <th className="pb-3 font-medium">Change List</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedVerdictPlayers.map((player) => {
                            const verdicts = videoscoutingData.get(player.playerID)
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
                                  {verdicts?.dataVerdict ? (
                                    <Badge variant={
                                      verdicts.dataVerdict === 'Good' ? 'followup' :
                                      verdicts.dataVerdict === 'Average' ? 'discuss' :
                                      'notgood'
                                    }>
                                      {verdicts.dataVerdict}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  {verdicts?.kyleVerdict ? (
                                    <Badge variant={
                                      verdicts.kyleVerdict === 'Follow-up' ? 'followup' :
                                      verdicts.kyleVerdict === 'Continue Monitoring' ? 'discuss' :
                                      'notgood'
                                    }>
                                      {verdicts.kyleVerdict}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  {verdicts?.toerVerdict ? (
                                    <Badge variant={
                                      verdicts.toerVerdict === 'Follow-up' ? 'followup' :
                                      verdicts.toerVerdict === 'Continue Monitoring' ? 'discuss' :
                                      'notgood'
                                    }>
                                      {verdicts.toerVerdict}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <span className={player.dataAvailable ? 'text-followup' : 'text-notgood'}>
                                    {player.dataAvailable ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <select
                                    value={player.currentList}
                                    onChange={(e) => handleListChange(player.playerID, e.target.value)}
                                    className="px-2 py-1 text-sm border rounded"
                                  >
                                    <option value="Prospects">Prospects</option>
                                    <option value="Datascouting list">Datascouting list</option>
                                    <option value="Videoscouting list">Videoscouting list</option>
                                    <option value="Live scouting list">Live scouting list</option>
                                    <option value="Potential list">Potential list</option>
                                    <option value="Not interesting list">Not interesting list</option>
                                  </select>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Videoscouting List Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-medium">Name</th>
                          <th className="pb-3 font-medium">Position</th>
                          <th className="pb-3 font-medium">Age</th>
                          <th className="pb-3 font-medium">Team</th>
                          <th className="pb-3 font-medium">League</th>
                          <th className="pb-3 font-medium">Datascouting Verdict</th>
                          <th className="pb-3 font-medium">Verdict Kyle</th>
                          <th className="pb-3 font-medium">Verdict Toer</th>
                          <th className="pb-3 font-medium">Data Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videoscoutingPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-muted-foreground">
                              No players in videoscouting list yet
                            </td>
                          </tr>
                        ) : (
                          videoscoutingPlayers.map((player) => {
                            const verdicts = videoscoutingData.get(player.playerID)
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
                                  {verdicts?.dataVerdict ? (
                                    <Badge variant={
                                      verdicts.dataVerdict === 'Good' ? 'followup' :
                                      verdicts.dataVerdict === 'Average' ? 'discuss' :
                                      'notgood'
                                    }>
                                      {verdicts.dataVerdict}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  {verdicts?.kyleVerdict ? (
                                    <Badge variant={
                                      verdicts.kyleVerdict === 'Follow-up' ? 'followup' :
                                      verdicts.kyleVerdict === 'Continue Monitoring' ? 'discuss' :
                                      'notgood'
                                    }>
                                      {verdicts.kyleVerdict}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  {verdicts?.toerVerdict ? (
                                    <Badge variant={
                                      verdicts.toerVerdict === 'Follow-up' ? 'followup' :
                                      verdicts.toerVerdict === 'Continue Monitoring' ? 'discuss' :
                                      'notgood'
                                    }>
                                      {verdicts.toerVerdict}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <span className={player.dataAvailable ? 'text-followup' : 'text-notgood'}>
                                    {player.dataAvailable ? 'Yes' : 'No'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Videoscout: Players Without My Verdict */}
          {user?.role === 'videoscout' && (
            <Card>
              <CardHeader>
                <CardTitle>Players Pending Your Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Position</th>
                        <th className="pb-3 font-medium">Age</th>
                        <th className="pb-3 font-medium">Team</th>
                        <th className="pb-3 font-medium">League</th>
                        <th className="pb-3 font-medium">Datascouting Verdict</th>
                        <th className="pb-3 font-medium">Verdict Kyle</th>
                        <th className="pb-3 font-medium">Verdict Toer</th>
                        <th className="pb-3 font-medium">Data Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playersWithoutMyVerdict.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-muted-foreground">
                            All caught up! No players pending your verdict.
                          </td>
                        </tr>
                      ) : (
                        playersWithoutMyVerdict.map((player) => {
                          const verdicts = videoscoutingData.get(player.playerID)
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
                                {verdicts?.dataVerdict ? (
                                  <Badge variant={
                                    verdicts.dataVerdict === 'Good' ? 'followup' :
                                    verdicts.dataVerdict === 'Average' ? 'discuss' :
                                    'notgood'
                                  }>
                                    {verdicts.dataVerdict}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </td>
                              <td className="py-3">
                                {verdicts?.kyleVerdict ? (
                                  <Badge variant={
                                    verdicts.kyleVerdict === 'Follow-up' ? 'followup' :
                                    verdicts.kyleVerdict === 'Continue Monitoring' ? 'discuss' :
                                    'notgood'
                                  }>
                                    {verdicts.kyleVerdict}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </td>
                              <td className="py-3">
                                {verdicts?.toerVerdict ? (
                                  <Badge variant={
                                    verdicts.toerVerdict === 'Follow-up' ? 'followup' :
                                    verdicts.toerVerdict === 'Continue Monitoring' ? 'discuss' :
                                    'notgood'
                                  }>
                                    {verdicts.toerVerdict}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </td>
                              <td className="py-3">
                                <span className={player.dataAvailable ? 'text-followup' : 'text-notgood'}>
                                  {player.dataAvailable ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Livescout: Live Scouting List */}
          {user?.role === 'livescout' && (
            <Card>
              <CardHeader>
                <CardTitle>Live Scouting List</CardTitle>
              </CardHeader>
              <CardContent>
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
                      </tr>
                    </thead>
                    <tbody>
                      {livescoutingPlayers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No players in live scouting list yet
                          </td>
                        </tr>
                      ) : (
                        livescoutingPlayers.map((player) => {
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
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Player List */}
        {selectedList && (
          <div className="w-1/3">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedList}</CardTitle>
                    <button 
                      onClick={() => setSelectedList(null)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-calm"
                    >
                      Close
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[70vh] overflow-y-auto space-y-2">
                    {filteredPlayers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No players in this list yet
                      </p>
                    ) : (
                      filteredPlayers.map((player) => {
                        const age = player.dateOfBirth 
                          ? calculateAge(player.dateOfBirth)
                          : null
                        
                        // Get verdict for videoscout users
                        const verdicts = videoscoutingData.get(player.playerID)
                        const myVerdict = user?.email === 'kyle' ? verdicts?.kyleVerdict : 
                                         user?.email === 'toer' ? verdicts?.toerVerdict : null
                        
                        // Get data verdict for datascout users
                        const dataVerdict = verdicts?.dataVerdict
                        
                        return (
                          <Link
                            key={player.playerID}
                            to={`/player/${player.playerID}`}
                            className="block"
                          >
                            <div className="px-3 py-2 rounded-lg border border-border hover:bg-accent/10 transition-calm hover-lift">
                              {/* Compact Header: Name, Age, Position */}
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-sm">
                                  {player.name} {age && `(${age})`}
                                </div>
                                {user?.role === 'videoscout' && myVerdict && (
                                  <Badge variant={
                                    myVerdict === 'Follow-up' ? 'followup' :
                                    myVerdict === 'Continue Monitoring' ? 'discuss' :
                                    'notgood'
                                  } className="text-xs">
                                    {myVerdict}
                                  </Badge>
                                )}
                                {user?.role === 'datascout' && dataVerdict && (
                                  <Badge variant={
                                    dataVerdict === 'Good' ? 'followup' :
                                    dataVerdict === 'Average' ? 'discuss' :
                                    'notgood'
                                  } className="text-xs">
                                    {dataVerdict}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Compact Info Grid */}
                              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium text-foreground">{player.currentTeam}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">{player.positionProfile || 'TBD'}</span>
                                </div>
                                
                                <div>
                                  Subprofile: <span className="font-medium text-primary">
                                    <SubprofileDisplay playerID={player.playerID} />
                                  </span>
                                </div>
                                <div>
                                  Data: <span className={player.dataAvailable ? 'text-followup font-medium' : 'text-notgood font-medium'}>
                                    {player.dataAvailable ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
