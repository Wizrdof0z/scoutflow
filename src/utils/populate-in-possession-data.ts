import { supabase } from '@/lib/supabase'

const SKILLCORNER_AUTH = 'Basic ' + btoa('jquant90@gmail.com:Delepelaar6!')

// Improved rate limiter using sliding window approach
const MAX_REQUESTS_PER_SECOND = 15
const MIN_INTERVAL_MS = 1000 / MAX_REQUESTS_PER_SECOND // ~67ms between requests

class RateLimiter {
  private queue: Array<{ fn: () => Promise<any>; resolve: (value: any) => void; reject: (err: any) => void }> = []
  private lastRequestTime = 0
  private processing = false

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject
      })
      
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      
      // If not enough time has passed, wait
      if (timeSinceLastRequest < MIN_INTERVAL_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL_MS - timeSinceLastRequest))
      }
      
      const item = this.queue.shift()
      if (item) {
        this.lastRequestTime = Date.now()
        
        try {
          const result = await item.fn()
          item.resolve(result)
        } catch (error) {
          item.reject(error)
        }
      }
    }

    this.processing = false
  }
}

const rateLimiter = new RateLimiter()

interface TeamCompetitionPair {
  team_id: number
  team_name: string
  competition_edition_id: number
  competition_name: string
  season_name: string
}

// Get unique team-competition_edition pairs from the teams table (source of truth)
async function getTeamCompetitionPairs(seasonFilter?: string, competitionFilter?: string): Promise<TeamCompetitionPair[]> {
  const allData: any[] = []
  const pageSize = 1000
  let page = 0
  let hasMore = true

  while (hasMore) {
    let query = supabase
      .from('teams')
      .select('team_id, team_name, competition_edition_id, competition_name, season_name')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (seasonFilter) {
      query = query.eq('season_name', seasonFilter)
    }

    if (competitionFilter) {
      query = query.eq('competition_name', competitionFilter)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch team-competition pairs: ${error.message}`)
    }

    if (data && data.length > 0) {
      allData.push(...data)
      page++
      
      if (data.length < pageSize) {
        hasMore = false
      }
    } else {
      hasMore = false
    }
  }

  console.log(`Fetched ${allData.length} total records from teams table`)

  // Get unique combinations (teams table should already be unique, but just in case)
  const uniquePairs = new Map<string, TeamCompetitionPair>()
  allData.forEach(item => {
    const key = `${item.team_id}-${item.competition_edition_id}`
    if (!uniquePairs.has(key)) {
      uniquePairs.set(key, {
        team_id: item.team_id,
        team_name: item.team_name,
        competition_edition_id: item.competition_edition_id,
        competition_name: item.competition_name,
        season_name: item.season_name
      })
    }
  })

  return Array.from(uniquePairs.values())
}

// Get today's date in YYYY-MM-DD format for date filter
function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Fetch physical data from API
async function fetchPhysicalData(teamId: number, competitionEditionId: number) {
  const today = getTodayDate()
  const url = `https://skillcorner.com/api/physical/?competition_edition=${competitionEditionId}&team=${teamId}&position=LCB,CB,RCB,LWB,LB,RB,RWB,LDM,DM,RDM,LM,CM,RM,AM,LW,RW,LF,RF,CF&date__lte=${today}&results=win,lose,draw&venue=home,away&period=full&possession=all&physical_check_passed=true&group_by=player,team,position,season&response_format=json&average_per=p90&data_version=3.0.2`
  
  const response = await fetch(url, {
    headers: { 'Authorization': SKILLCORNER_AUTH }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Fetch off-ball runs data from API
async function fetchOffBallRunsData(teamId: number, competitionEditionId: number) {
  const today = getTodayDate()
  const url = `https://skillcorner.com/api/in_possession/off_ball_runs/?competition_edition=${competitionEditionId}&team=${teamId}&date__lte=${today}&results=win,lose,draw&venue=home,away&channel=all&third=all&run_type=run_in_behind%2Crun_ahead_of_the_ball%2Csupport_run%2Cpulling_wide_run%2Ccoming_short_run%2Cunderlap_run%2Coverlap_run%2Cdropping_off_run%2Cpulling_half_space_run%2Ccross_receiver_run&average_per=match&group_by=player,team,position,season,competition`
  
  const response = await fetch(url, {
    headers: { 'Authorization': SKILLCORNER_AUTH }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Fetch on-ball pressures data from API
async function fetchOnBallPressuresData(teamId: number, competitionEditionId: number) {
  const today = getTodayDate()
  const url = `https://skillcorner.com/api/in_possession/on_ball_pressures/?competition_edition=${competitionEditionId}&team=${teamId}&date__lte=${today}&results=win,lose,draw&venue=home,away&channel=all&third=all&pressure_intensity=low%2Cmedium%2Chigh&average_per=match&group_by=player,team,position,season,competition`
  
  const response = await fetch(url, {
    headers: { 'Authorization': SKILLCORNER_AUTH }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Fetch passing data from API
async function fetchPassingData(teamId: number, competitionEditionId: number) {
  const today = getTodayDate()
  const url = `https://skillcorner.com/api/in_possession/passes/?competition_edition=${competitionEditionId}&team=${teamId}&date__lte=${today}&results=win,lose,draw&venue=home,away&channel=all&third=all&run_type=run_in_behind%2Crun_ahead_of_the_ball%2Csupport_run%2Cpulling_wide_run%2Ccoming_short_run%2Cunderlap_run%2Coverlap_run%2Cdropping_off_run%2Cpulling_half_space_run%2Ccross_receiver_run&average_per=match&group_by=player,team,position,season,competition`
  
  const response = await fetch(url, {
    headers: { 'Authorization': SKILLCORNER_AUTH }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

interface PopulateStats {
  physical: { success: number; error: number; skipped: number }
  offBallRuns: { success: number; error: number; skipped: number }
  onBallPressures: { success: number; error: number; skipped: number }
  passing: { success: number; error: number; skipped: number }
}

export async function populateInPossessionData(
  seasonFilter?: string,
  competitionFilter?: string
): Promise<PopulateStats> {
  console.log('=== Fetching All SkillCorner Statistics (Physical + In-Possession) ===\n')
  
  const filterDesc = []
  if (seasonFilter) filterDesc.push(`Season: ${seasonFilter}`)
  if (competitionFilter) filterDesc.push(`Competition: ${competitionFilter}`)
  console.log(filterDesc.length > 0 ? `Filters: ${filterDesc.join(', ')}` : 'Fetching for all seasons and competitions')
  console.log(`Date filter: Matches before ${getTodayDate()}\n`)
  
  const pairs = await getTeamCompetitionPairs(seasonFilter, competitionFilter)
  console.log(`\nFound ${pairs.length} unique team-competition_edition combinations\n`)

  const stats: PopulateStats = {
    physical: { success: 0, error: 0, skipped: 0 },
    offBallRuns: { success: 0, error: 0, skipped: 0 },
    onBallPressures: { success: 0, error: 0, skipped: 0 },
    passing: { success: 0, error: 0, skipped: 0 }
  }

  // Process all pairs with rate limiting
  const promises = pairs.map((pair, index) => {
    const progress = `[${index + 1}/${pairs.length}]`
    
    return Promise.all([
      // Physical data
      rateLimiter.add(async () => {
        try {
          console.log(`${progress} Fetching physical data for team ${pair.team_id} in competition ${pair.competition_edition_id}`)
          const data = await fetchPhysicalData(pair.team_id, pair.competition_edition_id)
          
          if (!data || !data.results || data.results.length === 0) {
            stats.physical.skipped++
            return
          }

          // Map records with explicit field mapping
          const records = data.results.map((item: any) => ({
            player_id: item.player_id,
            competition_edition_id: pair.competition_edition_id,
            position: item.position,
            player_name: item.player_name,
            player_short_name: item.player_short_name,
            player_birthdate: item.player_birthdate || null,
            team_id: item.team_id,
            team_name: item.team_name,
            season_id: item.season_id,
            season_name: item.season_name,
            competition_name: pair.competition_name,
            position_group: item.position_group,
            minutes_full_all: item.minutes_full_all,
            count_match: item.count_match,
            count_match_failed: item.count_match_failed,
            timetohsr_top3: item.timetohsr_top3,
            timetohsrpostcod_top3: item.timetohsrpostcod_top3,
            timetosprint_top3: item.timetosprint_top3,
            timetosprintpostcod_top3: item.timetosprintpostcod_top3,
            timeto505around90_top3: item.timeto505around90_top3,
            timeto505around180_top3: item.timeto505around180_top3,
            psv99: item.psv99,
            psv99_top5: item.psv99_top5,
            total_distance_full_all_p90: item.total_distance_full_all_p90,
            total_metersperminute_full_all_p90: item.total_metersperminute_full_all_p90,
            running_distance_full_all_p90: item.running_distance_full_all_p90,
            hsr_distance_full_all_p90: item.hsr_distance_full_all_p90,
            hsr_count_full_all_p90: item.hsr_count_full_all_p90,
            sprint_distance_full_all_p90: item.sprint_distance_full_all_p90,
            sprint_count_full_all_p90: item.sprint_count_full_all_p90,
            hi_distance_full_all_p90: item.hi_distance_full_all_p90,
            hi_count_full_all_p90: item.hi_count_full_all_p90,
            medaccel_count_full_all_p90: item.medaccel_count_full_all_p90,
            highaccel_count_full_all_p90: item.highaccel_count_full_all_p90,
            meddecel_count_full_all_p90: item.meddecel_count_full_all_p90,
            highdecel_count_full_all_p90: item.highdecel_count_full_all_p90,
            cod_count_full_all_p90: item.cod_count_full_all_p90,
            explacceltohsr_count_full_all_p90: item.explacceltohsr_count_full_all_p90,
            explacceltosprint_count_full_all_p90: item.explacceltosprint_count_full_all_p90
          }))

          const { error } = await supabase
            .from('physical_p90')
            .upsert(records, {
              onConflict: 'player_id,competition_edition_id,position'
            })

          if (error) {
            console.error(`  ✗ Physical error:`, error.message)
            stats.physical.error++
          } else {
            stats.physical.success++
          }
        } catch (err) {
          console.error(`  ✗ Physical error:`, err)
          stats.physical.error++
        }
      }),
      
      // Off-ball runs
      rateLimiter.add(async () => {
        try {
          console.log(`${progress} Fetching off-ball runs for team ${pair.team_id} in competition ${pair.competition_edition_id}`)
          const data = await fetchOffBallRunsData(pair.team_id, pair.competition_edition_id)
          
          const results = Array.isArray(data) ? data : (data?.results || [])
          if (!results || results.length === 0) {
            stats.offBallRuns.skipped++
            return
          }

          const records = results.map((item: any) => {
            const {
              count_coming_short_runs_leading_to_goal_per_match,
              count_coming_short_runs_leading_to_shot_per_match,
              count_cross_receiver_runs_leading_to_goal_per_match,
              count_cross_receiver_runs_leading_to_shot_per_match,
              count_dropping_off_runs_leading_to_goal_per_match,
              count_dropping_off_runs_leading_to_shot_per_match,
              count_overlap_runs_leading_to_goal_per_match,
              count_overlap_runs_leading_to_shot_per_match,
              count_pulling_half_space_runs_leading_to_goal_per_match,
              count_pulling_half_space_runs_leading_to_shot_per_match,
              count_pulling_wide_runs_leading_to_goal_per_match,
              count_pulling_wide_runs_leading_to_shot_per_match,
              count_runs_ahead_of_the_ball_leading_to_goal_per_match,
              count_runs_ahead_of_the_ball_leading_to_shot_per_match,
              count_runs_in_behind_leading_to_goal_per_match,
              count_runs_in_behind_leading_to_shot_per_match,
              count_underlap_runs_leading_to_goal_per_match,
              count_underlap_runs_leading_to_shot_per_match,
              ...rest
            } = item
            
            return {
              ...rest,
              player_birthdate: item.player_birthdate || null
            }
          })

          const { error } = await supabase
            .from('off_ball_runs_pmatch')
            .upsert(records, {
              onConflict: 'player_id,competition_edition_id,team_id,position'
            })

          if (error) {
            console.error(`  ✗ Off-ball runs error:`, error.message)
            stats.offBallRuns.error++
          } else {
            stats.offBallRuns.success++
          }
        } catch (err) {
          console.error(`  ✗ Off-ball runs error:`, err)
          stats.offBallRuns.error++
        }
      }),
      
      // On-ball pressures
      rateLimiter.add(async () => {
        try {
          console.log(`${progress} Fetching on-ball pressures for team ${pair.team_id} in competition ${pair.competition_edition_id}`)
          const data = await fetchOnBallPressuresData(pair.team_id, pair.competition_edition_id)
          
          const results = Array.isArray(data) ? data : (data?.results || [])
          if (!results || results.length === 0) {
            stats.onBallPressures.skipped++
            return
          }

          const records = results.map((item: any) => {
            const { 
              count_completed_dangerous_passes_under_medium_pressure_per_match,
              count_completed_difficult_passes_under_medium_pressure_per_match,
              ...rest 
            } = item
            
            return {
              ...rest,
              player_birthdate: item.player_birthdate || null
            }
          })

          const { error } = await supabase
            .from('on_ball_pressures_pmatch')
            .upsert(records, {
              onConflict: 'player_id,competition_edition_id,team_id,position'
            })

          if (error) {
            console.error(`  ✗ On-ball pressures error:`, error.message)
            stats.onBallPressures.error++
          } else {
            stats.onBallPressures.success++
          }
        } catch (err) {
          console.error(`  ✗ On-ball pressures error:`, err)
          stats.onBallPressures.error++
        }
      }),
      
      // Passing
      rateLimiter.add(async () => {
        try {
          console.log(`${progress} Fetching passing data for team ${pair.team_id} in competition ${pair.competition_edition_id}`)
          const data = await fetchPassingData(pair.team_id, pair.competition_edition_id)
          
          const results = Array.isArray(data) ? data : (data?.results || [])
          if (!results || results.length === 0) {
            stats.passing.skipped++
            return
          }

          const records = results.map((item: any) => {
            const {
              count_completed_pass_to_coming_short_runs_leading_to_goal_per_match,
              count_completed_pass_to_coming_short_runs_leading_to_shot_per_match,
              count_completed_pass_to_cross_receiver_runs_leading_to_goal_per_match,
              count_completed_pass_to_cross_receiver_runs_leading_to_shot_per_match,
              count_completed_pass_to_dangerous_pulling_half_space_runs_per_match,
              count_completed_pass_to_dangerous_runs_ahead_of_the_ball_per_match,
              count_completed_pass_to_dropping_off_runs_leading_to_goal_per_match,
              count_completed_pass_to_dropping_off_runs_leading_to_shot_per_match,
              count_completed_pass_to_overlap_runs_leading_to_goal_per_match,
              count_completed_pass_to_overlap_runs_leading_to_shot_per_match,
              count_completed_pass_to_pulling_half_space_runs_leading_to_goal_per_match,
              count_completed_pass_to_pulling_half_space_runs_leading_to_shot_per_match,
              count_completed_pass_to_pulling_wide_runs_leading_to_goal_per_match,
              count_completed_pass_to_pulling_wide_runs_leading_to_shot_per_match,
              count_completed_pass_to_runs_ahead_of_the_ball_leading_to_goal_per_match,
              count_completed_pass_to_runs_ahead_of_the_ball_leading_to_shot_per_match,
              count_completed_pass_to_runs_in_behind_leading_to_goal_per_match,
              count_completed_pass_to_runs_in_behind_leading_to_shot_per_match,
              count_completed_pass_to_underlap_runs_leading_to_goal_per_match,
              count_completed_pass_to_underlap_runs_leading_to_shot_per_match,
              count_opportunities_to_pass_to_pulling_half_space_runs_in_sample,
              count_opportunities_to_pass_to_pulling_half_space_runs_per_match,
              count_pass_attempts_to_dangerous_pulling_half_space_runs_per_match,
              count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match,
              count_pass_opportunities_to_dangerous_coming_short_runs_per_match,
              count_pass_opportunities_to_dangerous_cross_receiver_runs_per_match,
              count_pass_opportunities_to_dangerous_dropping_off_runs_per_match,
              count_pass_opportunities_to_dangerous_pulling_half_space_runs_per_match,
              count_pass_opportunities_to_dangerous_pulling_wide_runs_per_match,
              count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match,
              count_pass_opportunities_to_dangerous_runs_in_behind_per_match,
              coming_short_runs_to_which_pass_attempted_threat_per_match,
              cross_receiver_runs_to_which_pass_attempted_threat_per_match,
              dropping_off_runs_to_which_pass_attempted_threat_per_match,
              overlap_runs_to_which_pass_attempted_threat_per_match,
              pulling_half_space_runs_to_which_pass_attempted_threat_per_match,
              pulling_wide_runs_to_which_pass_attempted_threat_per_match,
              runs_ahead_of_the_ball_to_which_pass_attempted_threat_per_match,
              runs_in_behind_to_which_pass_attempted_threat_per_match,
              support_runs_to_which_pass_attempted_threat_per_match,
              underlap_runs_to_which_pass_attempted_threat_per_match,
              coming_short_runs_to_which_pass_completed_threat_per_match,
              cross_receiver_runs_to_which_pass_completed_threat_per_match,
              dropping_off_runs_to_which_pass_completed_threat_per_match,
              overlap_runs_to_which_pass_completed_threat_per_match,
              pulling_half_space_runs_to_which_pass_completed_threat_per_match,
              pulling_wide_runs_to_which_pass_completed_threat_per_match,
              runs_ahead_of_the_ball_to_which_pass_completed_threat_per_match,
              runs_in_behind_to_which_pass_completed_threat_per_match,
              support_runs_to_which_pass_completed_threat_per_match,
              underlap_runs_to_which_pass_completed_threat_per_match,
              ...rest
            } = item
            
            return {
              ...rest,
              player_birthdate: item.player_birthdate || null
            }
          })

          const { error } = await supabase
            .from('passing_pmatch')
            .upsert(records, {
              onConflict: 'player_id,competition_edition_id,team_id,position'
            })

          if (error) {
            console.error(`  ✗ Passing error:`, error.message)
            stats.passing.error++
          } else {
            stats.passing.success++
          }
        } catch (err) {
          console.error(`  ✗ Passing error:`, err)
          stats.passing.error++
        }
      })
    ])
  })

  await Promise.all(promises)

  console.log(`\n=== All SkillCorner Statistics Fetch Complete ===`)
  console.log(`Physical - Success: ${stats.physical.success}, Skipped: ${stats.physical.skipped}, Errors: ${stats.physical.error}`)
  console.log(`Off-Ball Runs - Success: ${stats.offBallRuns.success}, Skipped: ${stats.offBallRuns.skipped}, Errors: ${stats.offBallRuns.error}`)
  console.log(`On-Ball Pressures - Success: ${stats.onBallPressures.success}, Skipped: ${stats.onBallPressures.skipped}, Errors: ${stats.onBallPressures.error}`)
  console.log(`Passing - Success: ${stats.passing.success}, Skipped: ${stats.passing.skipped}, Errors: ${stats.passing.error}`)

  return stats
}
