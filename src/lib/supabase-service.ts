import { supabase } from './supabase'
import type { Player, PlayerRating, Report, Verdict, DataScoutingEntry, VideoscoutingEntry, LiveScoutingEntry } from '@/types'

// Players
export async function getAllPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  
  return (data || []).map(row => ({
    playerID: row.player_id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    currentTeam: row.current_team,
    currentLeague: row.current_league,
    matchesPlayed: row.matches_played,
    nationality: row.nationality,
    foot: row.foot,
    marketValue: row.market_value,
    contractEndDate: row.contract_end_date,
    positionProfile: row.position_profile,
    dataAvailable: row.data_available,
    currentList: row.current_list || 'Prospects',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getPlayer(playerID: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('player_id', playerID)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null
  
  return {
    playerID: data.player_id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    currentTeam: data.current_team,
    currentLeague: data.current_league,
    matchesPlayed: data.matches_played,
    nationality: data.nationality,
    foot: data.foot,
    marketValue: data.market_value,
    contractEndDate: data.contract_end_date,
    positionProfile: data.position_profile,
    dataAvailable: data.data_available,
    currentList: data.current_list || 'Prospects',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function createPlayer(player: Omit<Player, 'createdAt' | 'updatedAt'>): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({
      player_id: player.playerID,
      name: player.name,
      date_of_birth: player.dateOfBirth,
      current_team: player.currentTeam,
      current_league: player.currentLeague,
      matches_played: player.matchesPlayed,
      nationality: player.nationality,
      foot: player.foot,
      market_value: player.marketValue,
      contract_end_date: player.contractEndDate,
      position_profile: player.positionProfile,
      data_available: player.dataAvailable,
      current_list: player.currentList,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase createPlayer error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
  
  return {
    playerID: data.player_id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    currentTeam: data.current_team,
    currentLeague: data.current_league,
    matchesPlayed: data.matches_played,
    nationality: data.nationality,
    foot: data.foot,
    marketValue: data.market_value,
    contractEndDate: data.contract_end_date,
    positionProfile: data.position_profile,
    dataAvailable: data.data_available,
    currentList: data.current_list || 'Prospects',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updatePlayer(playerID: string, updates: Partial<Player>): Promise<void> {
  const { error } = await supabase
    .from('players')
    .update({
      name: updates.name,
      current_team: updates.currentTeam,
      current_league: updates.currentLeague,
      matches_played: updates.matchesPlayed,
      nationality: updates.nationality,
      foot: updates.foot,
      market_value: updates.marketValue,
      contract_end_date: updates.contractEndDate,
      position_profile: updates.positionProfile,
      data_available: updates.dataAvailable,
      current_list: updates.currentList,
      date_of_birth: updates.dateOfBirth,
    })
    .eq('player_id', playerID)

  if (error) throw error
}

export async function deletePlayer(playerID: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('player_id', playerID)

  if (error) throw error
}

// Player Ratings
export async function getPlayerRating(playerID: string, seasonID: string): Promise<PlayerRating | null> {
  const { data, error } = await supabase
    .from('player_ratings')
    .select('*')
    .eq('player_id', playerID)
    .eq('season_id', seasonID)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  if (!data) return null

  return {
    playerID: data.player_id,
    seasonID: data.season_id,
    overall: data.overall_rating,
    physical: data.physical_rating,
    movement: data.movement_rating,
    passing: data.passing_rating,
    pressure: data.pressure_rating,
    defensive: data.defensive_rating,
    ratedBy: data.rated_by,
    ratedAt: data.rated_at,
  }
}

export async function upsertPlayerRating(rating: Omit<PlayerRating, 'ratedAt'>): Promise<void> {
  const payload = {
    player_id: rating.playerID,
    season_id: rating.seasonID,
    overall_rating: rating.overall,
    physical_rating: rating.physical,
    movement_rating: rating.movement,
    passing_rating: rating.passing,
    pressure_rating: rating.pressure,
    defensive_rating: rating.defensive,
    rated_by: rating.ratedBy,
    rated_at: new Date().toISOString(),
  }
  
  console.log('Upserting player rating:', payload)
  
  const { error } = await supabase
    .from('player_ratings')
    .upsert(payload, {
      onConflict: 'player_id,season_id'
    })

  if (error) {
    console.error('Supabase upsertPlayerRating error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
}

// Reports
export async function getPlayerReports(playerID: string, seasonID: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('player_id', playerID)
    .eq('season_id', seasonID)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  
  return (data || []).map(report => ({
    reportID: report.report_id,
    playerID: report.player_id,
    seasonID: report.season_id,
    fileName: report.file_name,
    fileUrl: report.file_url,
    fileSize: report.file_size,
    mimeType: report.mime_type,
    uploadedBy: report.uploaded_by,
    uploadedAt: report.uploaded_at,
  }))
}

export async function createReport(report: Omit<Report, 'reportID' | 'uploadedAt'>): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      player_id: report.playerID,
      season_id: report.seasonID,
      file_name: report.fileName,
      file_url: report.fileUrl,
      file_size: report.fileSize,
      mime_type: report.mimeType,
      uploaded_by: report.uploadedBy,
    })
    .select()
    .single()

  if (error) throw error

  return {
    reportID: data.report_id,
    playerID: data.player_id,
    seasonID: data.season_id,
    fileName: data.file_name,
    fileUrl: data.file_url,
    fileSize: data.file_size,
    mimeType: data.mime_type,
    uploadedBy: data.uploaded_by,
    uploadedAt: data.uploaded_at,
  }
}

export async function deleteReport(reportID: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('report_id', reportID)

  if (error) throw error
}

// Verdicts
export async function getPlayerVerdicts(playerID: string, seasonID: string): Promise<Verdict[]> {
  const { data, error } = await supabase
    .from('verdicts')
    .select('*')
    .eq('player_id', playerID)
    .eq('season_id', seasonID)
    .order('submitted_at', { ascending: false })

  if (error) throw error

  return (data || []).map(verdict => ({
    verdictID: verdict.verdict_id,
    playerID: verdict.player_id,
    seasonID: verdict.season_id,
    scoutID: verdict.scout_id,
    scoutName: verdict.scout_name,
    verdictType: verdict.verdict_type,
    notes: verdict.notes,
    submittedAt: verdict.submitted_at,
  }))
}

export async function createVerdict(verdict: Omit<Verdict, 'verdictID' | 'submittedAt'>): Promise<void> {
  const { error } = await supabase
    .from('verdicts')
    .insert({
      player_id: verdict.playerID,
      season_id: verdict.seasonID,
      scout_id: verdict.scoutID,
      scout_name: verdict.scoutName,
      verdict_type: verdict.verdictType,
      notes: verdict.notes,
    })

  if (error) throw error
}

// Data Scouting
export async function getDataScoutingEntry(playerID: string, seasonID: string): Promise<DataScoutingEntry | null> {
  const { data, error } = await supabase
    .from('data_scouting_entries')
    .select('*')
    .eq('player_id', playerID)
    .eq('season_id', seasonID)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  if (!data) return null

  return {
    playerID: data.player_id,
    seasonID: data.season_id,
    dataVerdict: data.data_verdict,
    subProfile: data.sub_profile,
    datascoutID: data.datascout_id,
    datascoutedAt: data.datascouted_at,
    notes: data.notes,
  }
}

export async function upsertDataScoutingEntry(entry: DataScoutingEntry): Promise<void> {
  const payload = {
    player_id: entry.playerID,
    season_id: entry.seasonID,
    data_verdict: entry.dataVerdict || null,
    sub_profile: entry.subProfile || null,
    datascout_id: entry.datascoutID || null,
    datascouted_at: entry.datascoutedAt || null,
    notes: entry.notes || null,
  }
  
  console.log('Upserting data scouting entry:', payload)
  
  const { error } = await supabase
    .from('data_scouting_entries')
    .upsert(payload, {
      onConflict: 'player_id,season_id'
    })

  if (error) {
    console.error('Supabase upsertDataScoutingEntry error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
}

// Videoscouting
export async function getVideoscoutingEntry(playerID: string, seasonID: string): Promise<VideoscoutingEntry | null> {
  const { data, error } = await supabase
    .from('videoscouting_entries')
    .select('*')
    .eq('player_id', playerID)
    .eq('season_id', seasonID)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  if (!data) return null

  return {
    playerID: data.player_id,
    seasonID: data.season_id,
    kyleVerdict: data.kyle_verdict,
    kyleVideoscoutedAt: data.kyle_videoscouted_at,
    kyleNotes: data.kyle_notes,
    toerVerdict: data.toer_verdict,
    toerVideoscoutedAt: data.toer_videoscouted_at,
    toerNotes: data.toer_notes,
  }
}

export async function upsertVideoscoutingEntry(entry: VideoscoutingEntry): Promise<void> {
  const payload = {
    player_id: entry.playerID,
    season_id: entry.seasonID,
    kyle_verdict: entry.kyleVerdict || null,
    kyle_videoscouted_at: entry.kyleVideoscoutedAt || null,
    kyle_notes: entry.kyleNotes || null,
    toer_verdict: entry.toerVerdict || null,
    toer_videoscouted_at: entry.toerVideoscoutedAt || null,
    toer_notes: entry.toerNotes || null,
  }
  
  console.log('Upserting videoscouting entry:', payload)
  
  const { error } = await supabase
    .from('videoscouting_entries')
    .upsert(payload, {
      onConflict: 'player_id,season_id'
    })

  if (error) {
    console.error('Supabase upsertVideoscoutingEntry error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
}

// Live Scouting
export async function getLiveScoutingEntry(playerID: string, seasonID: string): Promise<LiveScoutingEntry | null> {
  const { data, error } = await supabase
    .from('live_scouting_entries')
    .select('*')
    .eq('player_id', playerID)
    .eq('season_id', seasonID)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  if (!data) return null

  return {
    playerID: data.player_id,
    seasonID: data.season_id,
    liveScoutingPercentage: data.live_scouting_percentage,
    livescoutID: data.livescout_id,
    livescoutedAt: data.livescouted_at,
    notes: data.notes,
  }
}

export async function upsertLiveScoutingEntry(entry: LiveScoutingEntry): Promise<void> {
  const payload = {
    player_id: entry.playerID,
    season_id: entry.seasonID,
    live_scouting_percentage: entry.liveScoutingPercentage || null,
    livescout_id: entry.livescoutID || null,
    livescouted_at: entry.livescoutedAt || null,
    notes: entry.notes || null,
  }
  
  console.log('Upserting live scouting entry:', payload)
  
  const { error } = await supabase
    .from('live_scouting_entries')
    .upsert(payload, {
      onConflict: 'player_id,season_id'
    })

  if (error) {
    console.error('Supabase upsertLiveScoutingEntry error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
}

// Batch query functions for performance optimization
export async function getAllPlayerRatings(seasonID: string): Promise<Map<string, PlayerRating>> {
  const { data, error } = await supabase
    .from('player_ratings')
    .select('*')
    .eq('season_id', seasonID)

  if (error) throw error

  const ratingsMap = new Map<string, PlayerRating>()
  
  if (data) {
    data.forEach(row => {
      ratingsMap.set(row.player_id, {
        playerID: row.player_id,
        seasonID: row.season_id,
        overall: row.overall_rating,
        physical: row.physical,
        movement: row.movement,
        passing: row.passing,
        pressure: row.pressure,
        defensive: row.defensive,
        ratedBy: row.rated_by,
        ratedAt: row.rated_at,
      })
    })
  }

  return ratingsMap
}

export async function getAllDataScoutingEntries(seasonID: string): Promise<Map<string, DataScoutingEntry>> {
  const { data, error } = await supabase
    .from('data_scouting_entries')
    .select('*')
    .eq('season_id', seasonID)

  if (error) throw error

  const entriesMap = new Map<string, DataScoutingEntry>()
  
  if (data) {
    data.forEach(row => {
      entriesMap.set(row.player_id, {
        playerID: row.player_id,
        seasonID: row.season_id,
        dataVerdict: row.data_verdict,
        subProfile: row.sub_profile,
        datascoutID: row.datascout_id,
        datascoutedAt: row.datascouted_at,
        notes: row.notes,
      })
    })
  }

  return entriesMap
}

export async function getAllVideoscoutingEntries(seasonID: string): Promise<Map<string, VideoscoutingEntry>> {
  const { data, error } = await supabase
    .from('videoscouting_entries')
    .select('*')
    .eq('season_id', seasonID)

  if (error) throw error

  const entriesMap = new Map<string, VideoscoutingEntry>()
  
  if (data) {
    data.forEach(row => {
      entriesMap.set(row.player_id, {
        playerID: row.player_id,
        seasonID: row.season_id,
        kyleVerdict: row.kyle_verdict,
        kyleVideoscoutedAt: row.kyle_videoscouted_at,
        kyleNotes: row.kyle_notes,
        toerVerdict: row.toer_verdict,
        toerVideoscoutedAt: row.toer_videoscouted_at,
        toerNotes: row.toer_notes,
      })
    })
  }

  return entriesMap
}

export async function getAllLiveScoutingEntries(seasonID: string): Promise<Map<string, LiveScoutingEntry>> {
  const { data, error } = await supabase
    .from('live_scouting_entries')
    .select('*')
    .eq('season_id', seasonID)

  if (error) throw error

  const entriesMap = new Map<string, LiveScoutingEntry>()
  
  if (data) {
    data.forEach(row => {
      entriesMap.set(row.player_id, {
        playerID: row.player_id,
        seasonID: row.season_id,
        liveScoutingPercentage: row.live_scouting_percentage,
        livescoutID: row.livescout_id,
        livescoutedAt: row.livescouted_at,
        notes: row.notes,
      })
    })
  }

  return entriesMap
}

export async function getAllPlayerReportCounts(seasonID: string): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('reports')
    .select('player_id')
    .eq('season_id', seasonID)

  if (error) throw error

  const reportCounts = new Map<string, number>()
  
  if (data) {
    data.forEach(row => {
      const count = reportCounts.get(row.player_id) || 0
      reportCounts.set(row.player_id, count + 1)
    })
  }

  return reportCounts
}
