import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import type { PositionProfile } from '@/types'
import { populateSkillCornerData } from '@/utils/populate-skillcorner-data'

interface UserPreferences {
  priorityPosition1: string
  priorityPosition2: string
  priorityPosition3: string
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [preferences, setPreferences] = useState<UserPreferences>({
    priorityPosition1: '',
    priorityPosition2: '',
    priorityPosition3: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [populating, setPopulating] = useState(false)
  const [populationStatus, setPopulationStatus] = useState('')
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([])
  
  // Unified SkillCorner stats state
  const [fetchingSkillCornerStats, setFetchingSkillCornerStats] = useState(false)
  const [skillCornerStatus, setSkillCornerStatus] = useState<string>('')
  const [skillCornerSeasonFilter, setSkillCornerSeasonFilter] = useState<string>('')
  const [skillCornerCompetitionFilter, setSkillCornerCompetitionFilter] = useState<string>('')
  const [availableCompetitions, setAvailableCompetitions] = useState<string[]>([])

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

  useEffect(() => {
    loadPreferences()
    loadAvailableSeasons()
    loadAvailableCompetitions()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.userID)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      if (data) {
        setPreferences({
          priorityPosition1: data.priority_position_1 || '',
          priorityPosition2: data.priority_position_2 || '',
          priorityPosition3: data.priority_position_3 || '',
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('season_name')
        .order('season_name', { ascending: false })
      
      if (error) throw error
      
      // Get unique season names
      const uniqueSeasons = [...new Set(data?.map(t => t.season_name) || [])]
      setAvailableSeasons(uniqueSeasons)
    } catch (error) {
      console.error('Error loading seasons:', error)
    }
  }

  const loadAvailableCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('player')
        .select('competition_name')
      
      if (error) throw error
      
      // Get unique competition names
      const uniqueCompetitions = [...new Set(data?.map(p => p.competition_name).filter(Boolean) || [])].sort()
      setAvailableCompetitions(uniqueCompetitions)
    } catch (error) {
      console.error('Error loading competitions:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.userID,
          priority_position_1: preferences.priorityPosition1 || null,
          priority_position_2: preferences.priorityPosition2 || null,
          priority_position_3: preferences.priorityPosition3 || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleFetchCompetitionEditions = async () => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can fetch SkillCorner data')
      return
    }

    setPopulating(true)
    setPopulationStatus('Fetching competition editions...')

    try {
      const { populateCompetitionEditions } = await import('@/utils/populate-skillcorner-data')
      await populateCompetitionEditions()
      setPopulationStatus('✓ Competition editions fetched successfully')
      alert('Competition editions fetched successfully!')
    } catch (error) {
      console.error('Error fetching competition editions:', error)
      setPopulationStatus('✗ Failed to fetch competition editions')
      alert('Failed to fetch competition editions')
    } finally {
      setPopulating(false)
    }
  }

  const handleFetchTeams = async () => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can fetch SkillCorner data')
      return
    }

    setPopulating(true)
    setPopulationStatus('Fetching teams for all competition editions...')

    try {
      const { populateAllTeams } = await import('@/utils/populate-skillcorner-data')
      await populateAllTeams()
      setPopulationStatus('✓ Teams fetched successfully')
      alert('Teams fetched successfully!')
      await loadAvailableSeasons() // Reload seasons after fetching teams
    } catch (error) {
      console.error('Error fetching teams:', error)
      setPopulationStatus('✗ Failed to fetch teams')
      alert('Failed to fetch teams')
    } finally {
      setPopulating(false)
    }
  }



  const handleFetchAllSkillCornerStats = async () => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can fetch SkillCorner statistics')
      return
    }

    const filterText = []
    if (skillCornerSeasonFilter) filterText.push(`season: ${skillCornerSeasonFilter}`)
    if (skillCornerCompetitionFilter) filterText.push(`competition: ${skillCornerCompetitionFilter}`)
    const filterDesc = filterText.length > 0 ? ` (${filterText.join(', ')})` : ' (all)'

    if (!confirm(`This will fetch ALL SkillCorner statistics (Physical, Off-Ball Runs, On-Ball Pressures, Passing)${filterDesc}. Estimated time: ~2 minutes. Continue?`)) {
      return
    }

    setFetchingSkillCornerStats(true)
    setSkillCornerStatus('Fetching all SkillCorner statistics (Physical + In-Possession data)...')

    try {
      const { populateInPossessionData } = await import('@/utils/populate-in-possession-data')
      const stats = await populateInPossessionData(
        skillCornerSeasonFilter || undefined,
        skillCornerCompetitionFilter || undefined
      )
      
      setSkillCornerStatus(`✓ All SkillCorner statistics fetched successfully!
        Physical: ${stats.physical.success} success, ${stats.physical.skipped} skipped, ${stats.physical.error} errors
        Off-Ball Runs: ${stats.offBallRuns.success} success, ${stats.offBallRuns.skipped} skipped, ${stats.offBallRuns.error} errors
        On-Ball Pressures: ${stats.onBallPressures.success} success, ${stats.onBallPressures.skipped} skipped, ${stats.onBallPressures.error} errors
        Passing: ${stats.passing.success} success, ${stats.passing.skipped} skipped, ${stats.passing.error} errors`)
      
      alert('All SkillCorner statistics fetched successfully! Check status for details.')
    } catch (error) {
      console.error('Error fetching SkillCorner statistics:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setSkillCornerStatus(`✗ Failed to fetch SkillCorner statistics: ${errorMessage}`)
      alert(`Failed to fetch SkillCorner statistics: ${errorMessage}`)
    } finally {
      setFetchingSkillCornerStats(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your preferences and automation settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datascouting List Auto-Fill Priorities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set priority positions to automatically fill your Datascouting list from Prospects.
              The system ensures you always have at least 5 players in your Datascouting list.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <Label>Priority 1 Position</Label>
                <Select
                  value={preferences.priorityPosition1}
                  onChange={(e) => setPreferences({ ...preferences, priorityPosition1: e.target.value })}
                >
                  <option value="">None</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Priority 2 Position</Label>
                <Select
                  value={preferences.priorityPosition2}
                  onChange={(e) => setPreferences({ ...preferences, priorityPosition2: e.target.value })}
                >
                  <option value="">None</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Priority 3 Position</Label>
                <Select
                  value={preferences.priorityPosition3}
                  onChange={(e) => setPreferences({ ...preferences, priorityPosition3: e.target.value })}
                >
                  <option value="">None</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/10 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>When you have less than 5 players in your Datascouting list</li>
                <li>The system selects players from Prospects matching your priority positions</li>
                <li>Priority 1 positions are filled first, then Priority 2, then Priority 3</li>
                <li>Oldest prospects are selected first (earliest added to the list)</li>
                <li>This runs automatically when you load the app</li>
              </ul>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Base Data (Competitions → Teams)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {populationStatus && (
                <div className={`p-2 rounded text-xs ${populationStatus.includes('✓') ? 'bg-green-50 text-green-800' : populationStatus.includes('✗') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                  {populationStatus}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Step 1</div>
                  <Button 
                    onClick={handleFetchCompetitionEditions} 
                    disabled={populating}
                    variant="default"
                    className="w-full h-9 text-sm"
                  >
                    Competitions
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Step 2</div>
                  <Button 
                    onClick={handleFetchTeams} 
                    disabled={populating}
                    variant="default"
                    className="w-full h-9 text-sm"
                  >
                    Teams
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>SkillCorner Statistics (Physical + In-Possession)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillCornerStatus && (
                <div className={`p-2 rounded text-xs ${skillCornerStatus.includes('✓') ? 'bg-green-50 text-green-800' : skillCornerStatus.includes('✗') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                  <div className="whitespace-pre-line">{skillCornerStatus}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Season (Optional)</Label>
                  <Select
                    value={skillCornerSeasonFilter}
                    onChange={(e) => setSkillCornerSeasonFilter(e.target.value)}
                    disabled={fetchingSkillCornerStats}
                    className="h-9 text-sm"
                  >
                    <option value="">All Seasons</option>
                    {availableSeasons.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Competition (Optional)</Label>
                  <Select
                    value={skillCornerCompetitionFilter}
                    onChange={(e) => setSkillCornerCompetitionFilter(e.target.value)}
                    disabled={fetchingSkillCornerStats}
                    className="h-9 text-sm"
                  >
                    <option value="">All Competitions</option>
                    {availableCompetitions.map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleFetchAllSkillCornerStats} 
                disabled={fetchingSkillCornerStats}
                variant="default"
                className="w-full h-9 text-sm"
              >
                {fetchingSkillCornerStats ? 'Fetching Statistics...' : 'Fetch All Statistics'}
              </Button>

              <div className="text-xs text-muted-foreground bg-accent/5 p-2 rounded">
                <strong>Info:</strong> Fetches Physical (47 fields), Off-Ball Runs (138 fields), On-Ball Pressures (59 fields), Passing (174 fields). 
                Rate-limited at 15 req/sec. Est. time: ~30 min for 287 team-competition pairs.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
