import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { getCurrentSeason } from '@/utils/helpers'
import { getLiveScoutingCategory } from '@/types'
import { Plus } from 'lucide-react'
import type { DataVerdict, VideoscoutingVerdict, LiveScoutingCategory } from '@/types'

export default function HomePage() {
  const players = useAppStore((state) => state.players)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  const getDataScoutingEntry = useAppStore((state) => state.getDataScoutingEntry)
  const getVideoscoutingEntry = useAppStore((state) => state.getVideoscoutingEntry)
  const getLiveScoutingEntry = useAppStore((state) => state.getLiveScoutingEntry)
  
  const [prospects, setProspects] = useState(0)
  const [datascouting, setDatascouting] = useState(0)
  const [videoscouting, setVideoscouting] = useState(0)
  const [livescouting, setLivescouting] = useState(0)
  const [potential, setPotential] = useState(0)
  const [notInteresting, setNotInteresting] = useState(0)
  
  // Data scouting verdict counts
  const [dataGood, setDataGood] = useState(0)
  const [dataAverage, setDataAverage] = useState(0)
  const [dataBad, setDataBad] = useState(0)
  
  // Videoscouting verdict counts
  const [videoFollowup, setVideoFollowup] = useState(0)
  const [videoMonitoring, setVideoMonitoring] = useState(0)
  const [videoNotGood, setVideoNotGood] = useState(0)
  
  // Live scouting category counts
  const [liveTop, setLiveTop] = useState(0)
  const [liveSubtop, setLiveSubtop] = useState(0)
  const [liveHeracles, setLiveHeracles] = useState(0)
  const [liveBottomEredivisie, setLiveBottomEredivisie] = useState(0)
  const [liveKKDSubtop, setLiveKKDSubtop] = useState(0)
  const [liveKKDMid, setLiveKKDMid] = useState(0)
  const [liveKKDBottom, setLiveKKDBottom] = useState(0)
  
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
  
  // Count players by verdicts
  useEffect(() => {
    async function countVerdicts() {
      const currentSeason = getCurrentSeason()
      
      // Initialize counts
      let dataGoodCount = 0
      let dataAverageCount = 0
      let dataBadCount = 0
      let videoFollowupCount = 0
      let videoMonitoringCount = 0
      let videoNotGoodCount = 0
      let liveTopCount = 0
      let liveSubtopCount = 0
      let liveHeraclesCount = 0
      let liveBottomEredivisieCount = 0
      let liveKKDSubtopCount = 0
      let liveKKDMidCount = 0
      let liveKKDBottomCount = 0
      
      for (const player of players) {
        // Count data verdicts
        try {
          const dataEntry = await getDataScoutingEntry(player.playerID, currentSeason.seasonID)
          if (dataEntry?.dataVerdict) {
            if (dataEntry.dataVerdict === 'Good') dataGoodCount++
            else if (dataEntry.dataVerdict === 'Average') dataAverageCount++
            else if (dataEntry.dataVerdict === 'Bad') dataBadCount++
          }
        } catch (e) { /* ignore */ }
        
        // Count videoscouting verdicts (count if either Kyle or Toer has verdict)
        try {
          const videoEntry = await getVideoscoutingEntry(player.playerID, currentSeason.seasonID)
          const verdicts = [videoEntry?.kyleVerdict, videoEntry?.toerVerdict].filter(Boolean)
          for (const verdict of verdicts) {
            if (verdict === 'Follow-up') videoFollowupCount++
            else if (verdict === 'Continue Monitoring') videoMonitoringCount++
            else if (verdict === 'Not Good Enough') videoNotGoodCount++
          }
        } catch (e) { /* ignore */ }
        
        // Count live scouting categories
        try {
          const liveEntry = await getLiveScoutingEntry(player.playerID, currentSeason.seasonID)
          if (liveEntry?.liveScoutingPercentage) {
            const category = getLiveScoutingCategory(liveEntry.liveScoutingPercentage)
            if (category === 'Top (80%+)') liveTopCount++
            else if (category === 'Subtop (75-79%)') liveSubtopCount++
            else if (category === 'Heracles (70-74%)') liveHeraclesCount++
            else if (category === 'Bottom Eredivisie (65-69%)') liveBottomEredivisieCount++
            else if (category === 'KKD Subtop (60-64%)') liveKKDSubtopCount++
            else if (category === 'KKD Mid-Table (55-59%)') liveKKDMidCount++
            else if (category === 'KKD Bottom (50-54%)') liveKKDBottomCount++
          }
        } catch (e) { /* ignore */ }
      }
      
      // Update all states at once
      setDataGood(dataGoodCount)
      setDataAverage(dataAverageCount)
      setDataBad(dataBadCount)
      setVideoFollowup(videoFollowupCount)
      setVideoMonitoring(videoMonitoringCount)
      setVideoNotGood(videoNotGoodCount)
      setLiveTop(liveTopCount)
      setLiveSubtop(liveSubtopCount)
      setLiveHeracles(liveHeraclesCount)
      setLiveBottomEredivisie(liveBottomEredivisieCount)
      setLiveKKDSubtop(liveKKDSubtopCount)
      setLiveKKDMid(liveKKDMidCount)
      setLiveKKDBottom(liveKKDBottomCount)
    }
    
    if (players.length > 0) {
      countVerdicts()
    } else {
      // Reset all counts when no players
      setDataGood(0)
      setDataAverage(0)
      setDataBad(0)
      setVideoFollowup(0)
      setVideoMonitoring(0)
      setVideoNotGood(0)
      setLiveTop(0)
      setLiveSubtop(0)
      setLiveHeracles(0)
      setLiveBottomEredivisie(0)
      setLiveKKDSubtop(0)
      setLiveKKDMid(0)
      setLiveKKDBottom(0)
    }
  }, [players, getDataScoutingEntry, getVideoscoutingEntry, getLiveScoutingEntry])
  
  // Get recently added players (last 5)
  const recentPlayers = [...players].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-semibold tracking-tight">
          Welcome back. Let's find the next standout.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A calm, structured space for data and video scouts to collaborate on player evaluations.
        </p>
        <div className="pt-4">
          <Link to="/add-player">
            <Button size="lg" className="space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New Player</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/list/Prospects">
          <Card className="hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Prospects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{prospects}</div>
              <p className="text-sm text-muted-foreground mt-2">New players to review</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/list/Datascouting list">
          <Card className="hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Data Scouting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent-foreground">{datascouting}</div>
              <p className="text-sm text-muted-foreground mt-2">For data analysis</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/list/Videoscouting list">
          <Card className="hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Video Scouting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-followup">{videoscouting}</div>
              <p className="text-sm text-muted-foreground mt-2">For video review</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/list/Live scouting list">
          <Card className="hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Live Scouting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-monitoring">{livescouting}</div>
              <p className="text-sm text-muted-foreground mt-2">To watch live</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/list/Potential list">
          <Card className="hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Potential</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-discuss">{potential}</div>
              <p className="text-sm text-muted-foreground mt-2">High potential players</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/list/Not interesting list">
          <Card className="hover:bg-accent/10 transition-calm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Not Interesting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-notgood">{notInteresting}</div>
              <p className="text-sm text-muted-foreground mt-2">Archived players</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Links - Removed old category links */}
      
      {/* Datascouting Access */}
      <Card>
        <CardHeader>
          <CardTitle>Datascouting Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/verdict/data/Good">
              <Button variant="followup" className="w-full h-16 text-lg">
                Good ({dataGood})
              </Button>
            </Link>
            <Link to="/verdict/data/Average">
              <Button variant="monitoring" className="w-full h-16 text-lg">
                Average ({dataAverage})
              </Button>
            </Link>
            <Link to="/verdict/data/Bad">
              <Button variant="notgood" className="w-full h-16 text-lg">
                Bad ({dataBad})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Videoscouting Access */}
      <Card>
        <CardHeader>
          <CardTitle>Videoscouting Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/verdict/video/Follow-up">
              <Button variant="followup" className="w-full h-16 text-lg">
                Follow-ups ({videoFollowup})
              </Button>
            </Link>
            <Link to="/verdict/video/Continue Monitoring">
              <Button variant="monitoring" className="w-full h-16 text-lg">
                Continue Monitoring ({videoMonitoring})
              </Button>
            </Link>
            <Link to="/verdict/video/Not Good Enough">
              <Button variant="notgood" className="w-full h-16 text-lg">
                Not Good Enough ({videoNotGood})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Live Scouting Access */}
      <Card>
        <CardHeader>
          <CardTitle>Live Scouting Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Link to="/verdict/live/Top (80%+)">
              <Button variant="followup" className="w-full h-16 text-sm">
                Top 80%+ ({liveTop})
              </Button>
            </Link>
            <Link to="/verdict/live/Subtop (75-79%)">
              <Button variant="followup" className="w-full h-16 text-sm">
                Subtop 75-79% ({liveSubtop})
              </Button>
            </Link>
            <Link to="/verdict/live/Heracles (70-74%)">
              <Button variant="followup" className="w-full h-16 text-sm">
                Heracles 70-74% ({liveHeracles})
              </Button>
            </Link>
            <Link to="/verdict/live/Bottom Eredivisie (65-69%)">
              <Button variant="monitoring" className="w-full h-16 text-sm">
                Bottom Eredivisie 65-69% ({liveBottomEredivisie})
              </Button>
            </Link>
            <Link to="/verdict/live/KKD Subtop (60-64%)">
              <Button variant="monitoring" className="w-full h-16 text-sm">
                KKD Subtop 60-64% ({liveKKDSubtop})
              </Button>
            </Link>
            <Link to="/verdict/live/KKD Mid-Table (55-59%)">
              <Button variant="notgood" className="w-full h-16 text-sm">
                KKD Mid 55-59% ({liveKKDMid})
              </Button>
            </Link>
            <Link to="/verdict/live/KKD Bottom (50-54%)">
              <Button variant="notgood" className="w-full h-16 text-sm">
                KKD Bottom 50-54% ({liveKKDBottom})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recently Added Players */}
      {recentPlayers.length > 0 && (
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
    </div>
  )
}
