import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import type { PositionProfile } from '@/types'

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
    </div>
  )
}
