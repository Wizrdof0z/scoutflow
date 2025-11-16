import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useAppStore } from '@/store'
import { getCurrentSeason, formatSeason, calculateAge, formatDate, formatCurrency, generateSeasons } from '@/utils/helpers'
import { getLiveScoutingCategory } from '@/types'
import { ArrowLeft, Calendar, MapPin, Users, TrendingUp, Edit2, Save, X, Upload, FileText, Download, Trash2 } from 'lucide-react'
import type { PlayerRating, Report, ListCategory } from '@/types'

export default function PlayerProfilePage() {
  const { playerID } = useParams<{ playerID: string }>()
  const navigate = useNavigate()
  
  const player = useAppStore((state) => state.getPlayer(playerID || ''))
  const addRating = useAppStore((state) => state.addRating)
  const getPlayerRatings = useAppStore((state) => state.getPlayerRatings)
  const getPlayerReports = useAppStore((state) => state.getPlayerReports)
  const addReport = useAppStore((state) => state.addReport)
  const deleteReport = useAppStore((state) => state.deleteReport)
  const getDataScoutingEntry = useAppStore((state) => state.getDataScoutingEntry)
  const updateDataScouting = useAppStore((state) => state.updateDataScouting)
  const getVideoscoutingEntry = useAppStore((state) => state.getVideoscoutingEntry)
  const updateVideoscouting = useAppStore((state) => state.updateVideoscouting)
  const getLiveScoutingEntry = useAppStore((state) => state.getLiveScoutingEntry)
  const updateLiveScouting = useAppStore((state) => state.updateLiveScouting)
  const updatePlayer = useAppStore((state) => state.updatePlayer)
  const loadPlayers = useAppStore((state) => state.loadPlayers)
  const user = useAppStore((state) => state.user)

  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason())
  const [isEditingRatings, setIsEditingRatings] = useState(false)
  const [existingRatings, setExistingRatings] = useState<PlayerRating | null>(null)
  const [isLoadingRatings, setIsLoadingRatings] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [uploadingReport, setUploadingReport] = useState(false)
  const [dataVerdict, setDataVerdict] = useState<'Good' | 'Average' | 'Bad' | ''>('')
  const [dataScoutingNotes, setDataScoutingNotes] = useState('')
  const [kyleVerdict, setKyleVerdict] = useState<'Follow-up' | 'Continue Monitoring' | 'Not Good Enough' | ''>('')
  const [kyleNotes, setKyleNotes] = useState('')
  const [toerVerdict, setToerVerdict] = useState<'Follow-up' | 'Continue Monitoring' | 'Not Good Enough' | ''>('')
  const [toerNotes, setToerNotes] = useState('')
  const [liveScoutingPercentage, setLiveScoutingPercentage] = useState<number>(0)
  const [liveScoutingNotes, setLiveScoutingNotes] = useState('')
  const [isEditingVideoscouting, setIsEditingVideoscouting] = useState(false)
  const [isEditingLiveScouting, setIsEditingLiveScouting] = useState(false)
  const [showFullProfile, setShowFullProfile] = useState(false)
  
  const [ratings, setRatings] = useState({
    overall: existingRatings?.overall || 0,
    physical: existingRatings?.physical || 0,
    movement: existingRatings?.movement || 0,
    passing: existingRatings?.passing || 0,
    pressure: existingRatings?.pressure || 0,
    defensive: existingRatings?.defensive || 0,
  })

  // Load ratings when season or player changes
  useEffect(() => {
    async function loadRatings() {
      if (!playerID) return
      
      setIsLoadingRatings(true)
      try {
        const seasonRatings = await getPlayerRatings(playerID, selectedSeason.seasonID)
        setExistingRatings(seasonRatings)
        
        if (seasonRatings) {
          setRatings({
            overall: seasonRatings.overall,
            physical: seasonRatings.physical,
            movement: seasonRatings.movement,
            passing: seasonRatings.passing,
            pressure: seasonRatings.pressure,
            defensive: seasonRatings.defensive,
          })
        } else {
          setRatings({
            overall: 0,
            physical: 0,
            movement: 0,
            passing: 0,
            pressure: 0,
            defensive: 0,
          })
        }
      } catch (error) {
        console.error('Error loading ratings:', error)
      } finally {
        setIsLoadingRatings(false)
      }
    }
    
    loadRatings()
  }, [playerID, selectedSeason.seasonID, getPlayerRatings])

  // Load reports when season or player changes
  useEffect(() => {
    async function loadReports() {
      if (!playerID) return
      
      setIsLoadingReports(true)
      try {
        const seasonReports = await getPlayerReports(playerID, selectedSeason.seasonID)
        setReports(seasonReports)
      } catch (error) {
        console.error('Error loading reports:', error)
      } finally {
        setIsLoadingReports(false)
      }
    }
    
    loadReports()
  }, [playerID, selectedSeason.seasonID, getPlayerReports])

  // Load data scouting entry when season or player changes
  useEffect(() => {
    async function loadDataScouting() {
      if (!playerID) return
      
      try {
        const entry = await getDataScoutingEntry(playerID, selectedSeason.seasonID)
        if (entry) {
          setDataVerdict(entry.dataVerdict || '')
          setDataScoutingNotes(entry.notes || '')
        } else {
          setDataVerdict('')
          setDataScoutingNotes('')
        }
      } catch (error) {
        console.error('Error loading data scouting entry:', error)
      }
    }

    loadDataScouting()
  }, [playerID, selectedSeason.seasonID, getDataScoutingEntry])

  // Load videoscouting entry when season or player changes
  useEffect(() => {
    async function loadVideoscouting() {
      if (!playerID) return
      
      try {
        const entry = await getVideoscoutingEntry(playerID, selectedSeason.seasonID)
        if (entry) {
          setKyleVerdict(entry.kyleVerdict || '')
          setKyleNotes(entry.kyleNotes || '')
          setToerVerdict(entry.toerVerdict || '')
          setToerNotes(entry.toerNotes || '')
        } else {
          setKyleVerdict('')
          setKyleNotes('')
          setToerVerdict('')
          setToerNotes('')
        }
      } catch (error) {
        console.error('Error loading videoscouting entry:', error)
      }
    }

    loadVideoscouting()
  }, [playerID, selectedSeason.seasonID, getVideoscoutingEntry])

  // Load live scouting entry when season or player changes
  useEffect(() => {
    async function loadLiveScouting() {
      if (!playerID) return
      
      try {
        const entry = await getLiveScoutingEntry(playerID, selectedSeason.seasonID)
        if (entry) {
          setLiveScoutingPercentage(entry.liveScoutingPercentage || 0)
          setLiveScoutingNotes(entry.notes || '')
        } else {
          setLiveScoutingPercentage(0)
          setLiveScoutingNotes('')
        }
      } catch (error) {
        console.error('Error loading live scouting entry:', error)
      }
    }

    loadLiveScouting()
  }, [playerID, selectedSeason.seasonID, getLiveScoutingEntry])

  if (!player) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Player not found</h2>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    )
  }

  // Generate available seasons (from 2020 to current)
  const availableSeasons = generateSeasons(2020, getCurrentSeason().endYear)

  const handleSaveRatings = async () => {
    if (!playerID) return

    try {
      // Save ratings (only if at least one rating is filled)
      if (ratings.overall > 0 || ratings.physical > 0 || ratings.movement > 0 || 
          ratings.passing > 0 || ratings.pressure > 0 || ratings.defensive > 0) {
        await addRating({
          playerID,
          seasonID: selectedSeason.seasonID,
          overall: ratings.overall,
          physical: ratings.physical,
          movement: ratings.movement,
          passing: ratings.passing,
          pressure: ratings.pressure,
          defensive: ratings.defensive,
          ratedBy: 'system', // Use 'system' instead of user ID
        })
      }

      // Save data verdict (optional)
      if (dataVerdict) {
        await updateDataScouting({
          playerID,
          seasonID: selectedSeason.seasonID,
          dataVerdict: dataVerdict as 'Good' | 'Average' | 'Bad',
          datascoutID: 'system', // Use 'system' instead of user ID
          datascoutedAt: new Date().toISOString(),
          notes: dataScoutingNotes || undefined,
        })
      }

      // Reload ratings to get the updated timestamp
      const updated = await getPlayerRatings(playerID, selectedSeason.seasonID)
      setExistingRatings(updated)
      setIsEditingRatings(false)
      
      alert('Saved successfully!')
    } catch (error) {
      console.error('Error saving ratings:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))
      alert(`Failed to save. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCancelEdit = () => {
    if (existingRatings) {
      setRatings({
        overall: existingRatings.overall,
        physical: existingRatings.physical,
        movement: existingRatings.movement,
        passing: existingRatings.passing,
        pressure: existingRatings.pressure,
        defensive: existingRatings.defensive,
      })
    }
    // Reload data verdict
    getDataScoutingEntry(playerID || '', selectedSeason.seasonID).then(entry => {
      if (entry) {
        setDataVerdict(entry.dataVerdict || '')
        setDataScoutingNotes(entry.notes || '')
      }
    })
    setIsEditingRatings(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !playerID || !user) return

    setUploadingReport(true)
    try {
      // In a real app, you would upload to cloud storage (Supabase Storage, S3, etc.)
      // For now, we'll create a mock file URL
      const fileUrl = `https://storage.example.com/reports/${file.name}`
      
      await addReport({
        playerID,
        seasonID: selectedSeason.seasonID,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: user.userID,
      })

      // Reload reports
      const updatedReports = await getPlayerReports(playerID, selectedSeason.seasonID)
      setReports(updatedReports)
      
      alert('Report uploaded successfully!')
    } catch (error) {
      console.error('Error uploading report:', error)
      alert('Failed to upload report. Please try again.')
    } finally {
      setUploadingReport(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleDeleteReport = async (reportID: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    if (!playerID) return

    try {
      await deleteReport(reportID)
      
      // Reload reports
      const updatedReports = await getPlayerReports(playerID, selectedSeason.seasonID)
      setReports(updatedReports)
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report. Please try again.')
    }
  }

  const handleSaveVideoscouting = async () => {
    if (!playerID) return

    try {
      await updateVideoscouting({
        playerID,
        seasonID: selectedSeason.seasonID,
        kyleVerdict: kyleVerdict as 'Follow-up' | 'Continue Monitoring' | 'Not Good Enough' | undefined,
        kyleVideoscoutedAt: kyleVerdict ? new Date().toISOString() : undefined,
        kyleNotes: kyleNotes || undefined,
        toerVerdict: toerVerdict as 'Follow-up' | 'Continue Monitoring' | 'Not Good Enough' | undefined,
        toerVideoscoutedAt: toerVerdict ? new Date().toISOString() : undefined,
        toerNotes: toerNotes || undefined,
      })

      setIsEditingVideoscouting(false)
      alert('Videoscouting verdicts saved successfully!')
    } catch (error) {
      console.error('Error saving videoscouting:', error)
      alert('Failed to save videoscouting verdicts. Please try again.')
    }
  }

  const handleSaveLiveScouting = async () => {
    if (!playerID) return

    try {
      await updateLiveScouting({
        playerID,
        seasonID: selectedSeason.seasonID,
        liveScoutingPercentage: liveScoutingPercentage > 0 ? liveScoutingPercentage : undefined,
        livescoutID: 'system',
        livescoutedAt: new Date().toISOString(),
        notes: liveScoutingNotes || undefined,
      })

      setIsEditingLiveScouting(false)
      alert('Live scouting percentage saved successfully!')
    } catch (error) {
      console.error('Error saving live scouting:', error)
      alert('Failed to save live scouting percentage. Please try again.')
    }
  }

  const age = calculateAge(player.dateOfBirth)

  // Determine what sections to show based on current list and showFullProfile state
  const shouldShowDataSummary = () => {
    if (showFullProfile) return true
    return player.currentList === 'Prospects' || player.currentList === 'Datascouting list'
  }

  const shouldShowVideoscoutingSummary = () => {
    if (showFullProfile) return true
    return player.currentList === 'Videoscouting list'
  }

  const shouldShowLiveScoutingSummary = () => {
    if (showFullProfile) return true
    return player.currentList === 'Live scouting list'
  }

  const shouldShowDataReports = () => {
    if (showFullProfile) return true
    return player.currentList === 'Prospects' || player.currentList === 'Datascouting list'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Label>Season:</Label>
          <Select
            value={selectedSeason.seasonID}
            onChange={(e) => {
              const season = availableSeasons.find(s => s.seasonID === e.target.value)
              if (season) {
                setSelectedSeason(season)
                setIsEditingRatings(false)
              }
            }}
            className="w-40"
          >
            {availableSeasons.reverse().map((season) => (
              <option key={season.seasonID} value={season.seasonID}>
                {formatSeason(season)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Player Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-4xl">{player.name}</CardTitle>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{age} years old</span>
                </span>
                <span>•</span>
                <span>{formatDate(player.dateOfBirth)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Data Verdict Badge */}
              {dataVerdict && (
                <Badge 
                  variant={dataVerdict === 'Good' ? 'followup' : dataVerdict === 'Average' ? 'monitoring' : 'notgood'} 
                  className="text-base px-4 py-2"
                >
                  {dataVerdict}
                </Badge>
              )}
              {/* Videoscouting Verdict Badges */}
              {kyleVerdict && (
                <Badge 
                  variant={kyleVerdict === 'Follow-up' ? 'followup' : kyleVerdict === 'Continue Monitoring' ? 'monitoring' : 'notgood'} 
                  className="text-base px-4 py-2"
                >
                  Kyle: {kyleVerdict === 'Follow-up' ? 'Follow-up' : kyleVerdict === 'Continue Monitoring' ? 'Monitoring' : 'Not Good'}
                </Badge>
              )}
              {toerVerdict && (
                <Badge 
                  variant={toerVerdict === 'Follow-up' ? 'followup' : toerVerdict === 'Continue Monitoring' ? 'monitoring' : 'notgood'} 
                  className="text-base px-4 py-2"
                >
                  Toer: {toerVerdict === 'Follow-up' ? 'Follow-up' : toerVerdict === 'Continue Monitoring' ? 'Monitoring' : 'Not Good'}
                </Badge>
              )}
              {/* Live Scouting Category Badge */}
              {liveScoutingPercentage > 0 && (() => {
                const category = getLiveScoutingCategory(liveScoutingPercentage);
                if (!category) return null;
                const variant = liveScoutingPercentage >= 70 ? 'followup' : liveScoutingPercentage >= 60 ? 'monitoring' : 'notgood';
                return (
                  <Badge variant={variant} className="text-base px-4 py-2">
                    Live: {category}
                  </Badge>
                );
              })()}
              {/* Position Badge */}
              {player.positionProfile && (
                <Badge variant="default" className="text-base px-4 py-2">
                  {player.positionProfile}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <Button 
              variant="accent" 
              size="sm"
              onClick={() => setShowFullProfile(!showFullProfile)}
            >
              {showFullProfile ? 'Hide Full Profile' : 'View Full Profile'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Current Team</div>
              <div className="font-medium flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{player.currentTeam}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">League</div>
              <div className="font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{player.currentLeague}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Nationality</div>
              <div className="font-medium">{player.nationality}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Preferred Foot</div>
              <div className="font-medium">{player.foot}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Matches Played</div>
              <div className="font-medium">{player.matchesPlayed}</div>
            </div>
            
            {player.marketValue && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Market Value</div>
                <div className="font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-followup" />
                  <span>{formatCurrency(player.marketValue)}</span>
                </div>
              </div>
            )}
            
            {player.contractEndDate && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Contract Until</div>
                <div className="font-medium">{formatDate(player.contractEndDate)}</div>
              </div>
            )}
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Data Available</div>
              <Badge variant={player.dataAvailable ? 'followup' : 'muted'}>
                {player.dataAvailable ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary Card - Only show for Prospects and Datascouting list */}
      {shouldShowDataSummary() && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Summary</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Season {formatSeason(selectedSeason)}
              </p>
            </div>
            {!isEditingRatings ? (
              <Button onClick={() => setIsEditingRatings(true)} variant="accent">
                <Edit2 className="h-4 w-4 mr-2" />
                {existingRatings ? 'Edit Ratings' : 'Add Ratings'}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveRatings} variant="followup" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Ratings
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <RatingInput
              label="Overall"
              value={ratings.overall}
              onChange={(value) => setRatings({ ...ratings, overall: value })}
              disabled={!isEditingRatings}
              color="primary"
            />
            
            {/* Physical Rating */}
            <RatingInput
              label="Physical"
              value={ratings.physical}
              onChange={(value) => setRatings({ ...ratings, physical: value })}
              disabled={!isEditingRatings}
              color="accent"
            />
            
            {/* Movement Rating */}
            <RatingInput
              label="Movement"
              value={ratings.movement}
              onChange={(value) => setRatings({ ...ratings, movement: value })}
              disabled={!isEditingRatings}
              color="accent"
            />
            
            {/* Passing Rating */}
            <RatingInput
              label="Passing"
              value={ratings.passing}
              onChange={(value) => setRatings({ ...ratings, passing: value })}
              disabled={!isEditingRatings}
              color="accent"
            />
            
            {/* Pressure Rating */}
            <RatingInput
              label="Pressure"
              value={ratings.pressure}
              onChange={(value) => setRatings({ ...ratings, pressure: value })}
              disabled={!isEditingRatings}
              color="accent"
            />
            
            {/* Defensive Rating */}
            <RatingInput
              label="Defensive Actions"
              value={ratings.defensive}
              onChange={(value) => setRatings({ ...ratings, defensive: value })}
              disabled={!isEditingRatings}
              color="accent"
            />
          </div>
          
          {/* Data Verdict Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Data Verdict</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataVerdict">Verdict</Label>
                <Select
                  id="dataVerdict"
                  value={dataVerdict}
                  onChange={(e) => setDataVerdict(e.target.value as 'Good' | 'Average' | 'Bad' | '')}
                  disabled={!isEditingRatings}
                >
                  <option value="">Select verdict...</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Bad">Bad</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataScoutingNotes">Notes</Label>
                <textarea
                  id="dataScoutingNotes"
                  value={dataScoutingNotes}
                  onChange={(e) => setDataScoutingNotes(e.target.value)}
                  disabled={!isEditingRatings}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground disabled:opacity-60"
                  placeholder="Add any notes about this player's data..."
                />
              </div>
            </div>
          </div>
          
          {existingRatings && !isEditingRatings && (
            <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
              Last updated: {formatDate(existingRatings.ratedAt)}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Videoscouting Summary Card - Only show for Videoscouting list */}
      {shouldShowVideoscoutingSummary() && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Videoscouting Summary</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Season {formatSeason(selectedSeason)}
              </p>
            </div>
            {!isEditingVideoscouting ? (
              <Button onClick={() => setIsEditingVideoscouting(true)} variant="accent">
                <Edit2 className="h-4 w-4 mr-2" />
                {(kyleVerdict || toerVerdict) ? 'Edit Verdicts' : 'Add Verdicts'}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={() => {
                  setIsEditingVideoscouting(false)
                  // Reload original values
                  getVideoscoutingEntry(playerID || '', selectedSeason.seasonID).then(entry => {
                    if (entry) {
                      setKyleVerdict(entry.kyleVerdict || '')
                      setKyleNotes(entry.kyleNotes || '')
                      setToerVerdict(entry.toerVerdict || '')
                      setToerNotes(entry.toerNotes || '')
                    }
                  })
                }} variant="ghost" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveVideoscouting} variant="followup" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Verdicts
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kyle's Verdict */}
            <div className="space-y-4 border-r border-border pr-6">
              <h3 className="font-semibold text-lg text-primary">Verdict Kyle</h3>
              <div className="space-y-2">
                <Label htmlFor="kyleVerdict">Verdict</Label>
                <Select
                  id="kyleVerdict"
                  value={kyleVerdict}
                  onChange={(e) => setKyleVerdict(e.target.value as 'Follow-up' | 'Continue Monitoring' | 'Not Good Enough' | '')}
                  disabled={!isEditingVideoscouting}
                >
                  <option value="">Select verdict...</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Continue Monitoring">Continue Monitoring</option>
                  <option value="Not Good Enough">Not Good Enough</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kyleNotes">Notes (Optional)</Label>
                <textarea
                  id="kyleNotes"
                  value={kyleNotes}
                  onChange={(e) => setKyleNotes(e.target.value)}
                  disabled={!isEditingVideoscouting}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground disabled:opacity-60"
                  placeholder="Add any notes about this player's video scouting..."
                />
              </div>
            </div>

            {/* Toer's Verdict */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">Verdict Toer</h3>
              <div className="space-y-2">
                <Label htmlFor="toerVerdict">Verdict</Label>
                <Select
                  id="toerVerdict"
                  value={toerVerdict}
                  onChange={(e) => setToerVerdict(e.target.value as 'Follow-up' | 'Continue Monitoring' | 'Not Good Enough' | '')}
                  disabled={!isEditingVideoscouting}
                >
                  <option value="">Select verdict...</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Continue Monitoring">Continue Monitoring</option>
                  <option value="Not Good Enough">Not Good Enough</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toerNotes">Notes (Optional)</Label>
                <textarea
                  id="toerNotes"
                  value={toerNotes}
                  onChange={(e) => setToerNotes(e.target.value)}
                  disabled={!isEditingVideoscouting}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground disabled:opacity-60"
                  placeholder="Add any notes about this player's video scouting..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Live Scouting Summary Card - Only show for Live scouting list */}
      {shouldShowLiveScoutingSummary() && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Scouting Summary</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Season {formatSeason(selectedSeason)}
              </p>
            </div>
            {!isEditingLiveScouting ? (
              <Button onClick={() => setIsEditingLiveScouting(true)} variant="accent">
                <Edit2 className="h-4 w-4 mr-2" />
                {liveScoutingPercentage > 0 ? 'Edit Percentage' : 'Add Percentage'}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={() => {
                  setIsEditingLiveScouting(false)
                  // Reload original values
                  getLiveScoutingEntry(playerID || '', selectedSeason.seasonID).then(entry => {
                    if (entry) {
                      setLiveScoutingPercentage(entry.liveScoutingPercentage || 0)
                      setLiveScoutingNotes(entry.notes || '')
                    }
                  })
                }} variant="ghost" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveLiveScouting} variant="followup" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Percentage
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="liveScoutingPercentage">Performance Percentage</Label>
                <span className="text-2xl font-bold text-primary">
                  {liveScoutingPercentage.toFixed(1)}%
                </span>
              </div>
              <input
                id="liveScoutingPercentage"
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={liveScoutingPercentage}
                onChange={(e) => setLiveScoutingPercentage(parseFloat(e.target.value))}
                disabled={!isEditingLiveScouting}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer disabled:opacity-60"
              />
              <div className="text-sm text-muted-foreground">
                {liveScoutingPercentage > 0 && getLiveScoutingCategory(liveScoutingPercentage) && (
                  <span className="font-medium">
                    Category: {getLiveScoutingCategory(liveScoutingPercentage)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="liveScoutingNotes">Notes (Optional)</Label>
              <textarea
                id="liveScoutingNotes"
                value={liveScoutingNotes}
                onChange={(e) => setLiveScoutingNotes(e.target.value)}
                disabled={!isEditingLiveScouting}
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground disabled:opacity-60"
                placeholder="Add any notes about this player's live scouting..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Player List Selector Card - Always shown */}
      <Card>
        <CardHeader>
          <CardTitle>Player List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentList">Move player to list:</Label>
              <Select
                id="currentList"
                value={player.currentList}
                onChange={async (e) => {
                  const newList = e.target.value as ListCategory
                  try {
                    await updatePlayer(player.playerID, { currentList: newList })
                    await loadPlayers() // Reload players
                    alert(`Player moved to "${newList}"`)
                  } catch (error) {
                    console.error('Error updating player list:', error)
                    alert('Failed to update player list')
                  }
                }}
              >
                <option value="Prospects">Prospects</option>
                <option value="Datascouting list">Datascouting list</option>
                <option value="Videoscouting list">Videoscouting list</option>
                <option value="Live scouting list">Live scouting list</option>
                <option value="Potential list">Potential list</option>
                <option value="Not interesting list">Not interesting list</option>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Current list: <strong>{player.currentList}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Reports Card - Only show for Prospects and Datascouting list */}
      {shouldShowDataReports() && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Reports</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Season {formatSeason(selectedSeason)}
              </p>
            </div>
            <div>
              <input
                type="file"
                id="report-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                disabled={uploadingReport}
              />
              <label htmlFor="report-upload" className="inline-block">
                <div className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-calm cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingReport ? 'Uploading...' : 'Upload Report'}
                </div>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports uploaded for this season yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.reportID}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/10 transition-calm"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{report.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        Uploaded {formatDate(report.uploadedAt)} • {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.reportID)}
                    >
                      <Trash2 className="h-4 w-4 text-notgood" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}

// Rating Input Component
interface RatingInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled: boolean
  color?: 'primary' | 'accent'
}

function RatingInput({ label, value, onChange, disabled, color = 'accent' }: RatingInputProps) {
  const colorClass = color === 'primary' ? 'text-primary' : 'text-accent-foreground'
  
  return (
    <div className="space-y-2">
      <Label className="text-base">{label}</Label>
      <Input
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value) || 0
          if (val >= 0 && val <= 100) {
            onChange(val)
          }
        }}
        disabled={disabled}
        className={`text-2xl font-bold ${colorClass} ${disabled ? 'opacity-60' : ''}`}
      />
      <div className="text-xs text-muted-foreground">
        Enter a value between 0 and 100 (e.g., 93.4)
      </div>
    </div>
  )
}
