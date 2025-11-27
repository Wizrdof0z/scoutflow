// Normalize positions to their canonical form for grouping and display
export const normalizePosition = (position: string): string => {
  const normalizationMap: Record<string, string> = {
    // Center Forward group
    'RF': 'CF',
    'LF': 'CF',
    'CF': 'CF',
    
    // Central Midfielder group
    'RM': 'CM',
    'LM': 'CM',
    'CM': 'CM',
    'RCM': 'CM',
    'LCM': 'CM',
    
    // Defensive Midfielder group
    'LDM': 'DM',
    'RDM': 'DM',
    'DM': 'DM',
    
    // Attacking Midfielder group
    'LAM': 'AM',
    'RAM': 'AM',
    'AM': 'AM',
    
    // Left Back group
    'LB': 'LB',
    'LWB': 'LB',
    
    // Right Back group
    'RB': 'RB',
    'RWB': 'RB',
    
    // Center Back group
    'LCB': 'CB',
    'RCB': 'CB',
    'CB': 'CB',
    
    // Wide positions (keep separate)
    'LW': 'LW',
    'RW': 'RW',
  }
  
  return normalizationMap[position] || position
}

// Map API positions to position groups
export const POSITION_GROUP_MAP: Record<string, string> = {
  // Center Forward
  'CF': 'Center Forward',
  'LF': 'Center Forward',
  'RF': 'Center Forward',
  
  // Attacking Midfielder
  'AM': 'Attacking Midfielder',
  
  // Defensive Midfielder
  'DM': 'Defensive Midfielder',
  'RDM': 'Defensive Midfielder',
  'LDM': 'Defensive Midfielder',
  
  // Central Midfielder
  'RM': 'Central Midfielder',
  'LM': 'Central Midfielder',
  'CM': 'Central Midfielder',
  'RCM': 'Central Midfielder',
  'LCM': 'Central Midfielder',
  
  // Left Fullback
  'LB': 'Left Fullback',
  'LWB': 'Left Fullback',
  
  // Right Fullback
  'RB': 'Right Fullback',
  'RWB': 'Right Fullback',
  
  // Central Defender
  'CB': 'Central Defender',
  'RCB': 'Central Defender',
  'LCB': 'Central Defender',
  
  // Wide Attacker
  'LW': 'Wide Attacker',
  'RW': 'Wide Attacker',
}

export function getPositionGroup(position: string): string {
  return POSITION_GROUP_MAP[position] || position
}

export function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null
  
  const birth = new Date(birthdate)
  
  // Check if date is valid
  if (isNaN(birth.getTime())) return null
  
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function formatStatValue(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A'
  return value.toFixed(decimals)
}
