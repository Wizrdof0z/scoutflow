import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { useAppStore } from '@/store'
import { Foot, PositionProfile } from '@/types'

export default function PlayerEntryPage() {
  const navigate = useNavigate()
  const addPlayer = useAppStore((state) => state.addPlayer)

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    currentTeam: '',
    currentLeague: '',
    matchesPlayed: 0,
    nationality: '',
    foot: 'Right' as Foot,
    marketValue: '',
    contractEndDate: '',
    positionProfile: '' as PositionProfile | '',
    dataAvailable: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newPlayer = await addPlayer({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        currentTeam: formData.currentTeam,
        currentLeague: formData.currentLeague,
        matchesPlayed: formData.matchesPlayed,
        nationality: formData.nationality,
        foot: formData.foot,
        marketValue: formData.marketValue ? Number(formData.marketValue) : undefined,
        contractEndDate: formData.contractEndDate || undefined,
        positionProfile: formData.positionProfile || undefined,
        dataAvailable: formData.dataAvailable,
        currentList: 'Prospects', // New players start in Prospects list
      })

      navigate(`/player/${newPlayer.playerID}`)
    } catch (error) {
      console.error('Error creating player:', error)
      alert('Failed to create player. Please try again.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1>Add New Player</h1>
        <p className="text-muted-foreground">This player's journey begins here.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mandatory Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" required>Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" required>Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentTeam" required>Current Team</Label>
                  <Input
                    id="currentTeam"
                    required
                    value={formData.currentTeam}
                    onChange={(e) => setFormData({ ...formData, currentTeam: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLeague" required>Current League</Label>
                  <Input
                    id="currentLeague"
                    required
                    value={formData.currentLeague}
                    onChange={(e) => setFormData({ ...formData, currentLeague: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchesPlayed" required>Matches Played</Label>
                  <Input
                    id="matchesPlayed"
                    type="number"
                    required
                    min="0"
                    value={formData.matchesPlayed}
                    onChange={(e) => setFormData({ ...formData, matchesPlayed: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality" required>Nationality</Label>
                  <Input
                    id="nationality"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foot" required>Preferred Foot</Label>
                  <Select
                    id="foot"
                    required
                    value={formData.foot}
                    onChange={(e) => setFormData({ ...formData, foot: e.target.value as Foot })}
                  >
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                    <option value="Both">Both</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positionProfile">Position Profile</Label>
                  <Select
                    id="positionProfile"
                    value={formData.positionProfile}
                    onChange={(e) => setFormData({ ...formData, positionProfile: e.target.value as PositionProfile })}
                  >
                    <option value="">Select position...</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Centre Back">Centre Back</option>
                    <option value="Left Fullback">Left Fullback</option>
                    <option value="Right Fullback">Right Fullback</option>
                    <option value="Defensive Midfielder">Defensive Midfielder</option>
                    <option value="Central Midfielder">Central Midfielder</option>
                    <option value="Attacking Midfielder">Attacking Midfielder</option>
                    <option value="Left Winger">Left Winger</option>
                    <option value="Right Winger">Right Winger</option>
                    <option value="Centre Forward">Centre Forward</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketValue">Market Value (€)</Label>
                  <Input
                    id="marketValue"
                    type="number"
                    min="0"
                    value={formData.marketValue}
                    onChange={(e) => setFormData({ ...formData, marketValue: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractEndDate">Contract End Date</Label>
                  <Input
                    id="contractEndDate"
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataAvailable">Data Available</Label>
                  <Select
                    id="dataAvailable"
                    value={formData.dataAvailable ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, dataAvailable: e.target.value === 'true' })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit">
                Create Player Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
