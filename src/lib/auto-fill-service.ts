import { supabase } from './supabase'
import type { Player } from '@/types'

interface UserPreferences {
  priorityPosition1: string
  priorityPosition2: string
  priorityPosition3: string
}

export async function getUserPreferences(userID: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userID)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null

    return {
      priorityPosition1: data.priority_position_1 || '',
      priorityPosition2: data.priority_position_2 || '',
      priorityPosition3: data.priority_position_3 || '',
    }
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return null
  }
}

export async function autoFillDataScoutingList(
  userID: string, 
  players: Player[], 
  onComplete?: () => void
): Promise<void> {
  try {
    // Get user preferences
    const preferences = await getUserPreferences(userID)
    if (!preferences) {
      console.log('No preferences found, skipping auto-fill')
      return
    }

    // Count players in Datascouting list
    const dataScoutingPlayers = players.filter(p => p.currentList === 'Datascouting list')
    
    if (dataScoutingPlayers.length >= 5) {
      console.log('Datascouting list already has 5+ players')
      return
    }

    // Get prospects sorted by createdAt (oldest first)
    const prospects = players
      .filter(p => p.currentList === 'Prospects')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (prospects.length === 0) {
      console.log('No prospects available to move')
      return
    }

    // Build priority positions list (excluding empty strings)
    const priorityPositions: string[] = [
      preferences.priorityPosition1,
      preferences.priorityPosition2,
      preferences.priorityPosition3,
    ].filter(pos => pos !== '')

    if (priorityPositions.length === 0) {
      console.log('No priority positions configured')
      return
    }

    const playersToMove: Player[] = []
    const needed = 5 - dataScoutingPlayers.length

    // Select players based on priority
    for (const priorityPosition of priorityPositions) {
      if (playersToMove.length >= needed) break

      const matchingProspects = prospects.filter(
        p => p.positionProfile === priorityPosition && 
        !playersToMove.find(pm => pm.playerID === p.playerID)
      )

      for (const prospect of matchingProspects) {
        if (playersToMove.length >= needed) break
        playersToMove.push(prospect)
      }
    }

    // If still not enough, fill with any remaining prospects
    if (playersToMove.length < needed) {
      for (const prospect of prospects) {
        if (playersToMove.length >= needed) break
        if (!playersToMove.find(pm => pm.playerID === prospect.playerID)) {
          playersToMove.push(prospect)
        }
      }
    }

    // Update players to Datascouting list
    if (playersToMove.length > 0) {
      console.log(`Moving ${playersToMove.length} players to Datascouting list:`, playersToMove.map(p => p.name))
      
      for (const player of playersToMove) {
        const { error } = await supabase
          .from('players')
          .update({ current_list: 'Datascouting list' })
          .eq('player_id', player.playerID)

        if (error) {
          console.error(`Error updating player ${player.name}:`, error)
        }
      }

      console.log('Auto-fill complete')
      
      // Trigger reload callback if provided
      if (onComplete) {
        onComplete()
      }
    } else {
      console.log('No eligible prospects found to move')
    }
  } catch (error) {
    console.error('Error in autoFillDataScoutingList:', error)
  }
}
