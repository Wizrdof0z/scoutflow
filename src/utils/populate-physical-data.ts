import { supabase } from '@/lib/supabase'
import { getPositionGroup } from './position-helpers'

const SKILLCORNER_API_URL = 'https://skillcorner.com/api/physical/'
const SKILLCORNER_AUTH = 'Basic ' + btoa('jquant90@gmail.com:Delepelaar6!')

const DELAY_BETWEEN_REQUESTS = 500 // 500ms delay between API calls

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface PhysicalDataResponse {
  results: Array<{
    player_name: string
    player_short_name: string
    player_id: number
    player_birthdate: string
    team_name: string
    team_id: number
    season_name: string
    season_id: number
    competition_name: string
    position: string
    position_group: string
    minutes_full_all: number
    count_match: number
    count_match_failed: number
    timetohsr_top3: number | null
    timetohsrpostcod_top3: number | null
    timetosprint_top3: number | null
    timetosprintpostcod_top3: number | null
    timeto505around90_top3: number | null
    timeto505around180_top3: number | null
    psv99: number | null
    psv99_top5: number | null
    total_distance_full_all_p90: number | null
    total_metersperminute_full_all_p90: number | null
    running_distance_full_all_p90: number | null
    hsr_distance_full_all_p90: number | null
    hsr_count_full_all_p90: number | null
    sprint_distance_full_all_p90: number | null
    sprint_count_full_all_p90: number | null
    hi_distance_full_all_p90: number | null
    hi_count_full_all_p90: number | null
    medaccel_count_full_all_p90: number | null
    highaccel_count_full_all_p90: number | null
    meddecel_count_full_all_p90: number | null
    highdecel_count_full_all_p90: number | null
    cod_count_full_all_p90: number | null
    explacceltohsr_count_full_all_p90: number | null
    explacceltosprint_count_full_all_p90: number | null
  }>
  count: number
}

async function fetchPhysicalData(playerId: number, competitionEditionId: number): Promise<PhysicalDataResponse> {
  const url = `${SKILLCORNER_API_URL}?competition_edition=${competitionEditionId}&player=${playerId}&position=LCB,CB,RCB,LWB,LB,RB,RWB,LDM,DM,RDM,LM,CM,RM,AM,LW,RW,LF,RF,CF&position_group=CentralDefender,FullBack,Midfield,WideAttacker,CenterForward&results=win,lose,draw&venue=home,away&period=full&possession=all&physical_check_passed=true&group_by=player,team,position_group,position,season&response_format=json&average_per=p90&data_version=3.0.2`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': SKILLCORNER_AUTH
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

interface PlayerCompetitionPair {
  player_id: number
  competition_edition_id: number
  season_name: string
  competition_name: string
}

async function getPlayerCompetitionPairs(seasonFilter?: string, competitionFilter?: string): Promise<PlayerCompetitionPair[]> {
  const allData: any[] = []
  const pageSize = 1000
  let page = 0
  let hasMore = true

  // Fetch all pages
  while (hasMore) {
    let query = supabase
      .from('player')
      .select('player_id, competition_edition_id, season_name, competition_name')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (seasonFilter) {
      query = query.eq('season_name', seasonFilter)
    }

    if (competitionFilter) {
      query = query.eq('competition_name', competitionFilter)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch player-competition pairs: ${error.message}`)
    }

    if (data && data.length > 0) {
      allData.push(...data)
      page++
      
      // If we got less than pageSize, we've reached the end
      if (data.length < pageSize) {
        hasMore = false
      }
    } else {
      hasMore = false
    }
  }

  console.log(`Fetched ${allData.length} total player records`)

  // Get unique combinations
  const uniquePairs = new Map<string, PlayerCompetitionPair>()
  allData.forEach(item => {
    const key = `${item.player_id}-${item.competition_edition_id}`
    if (!uniquePairs.has(key)) {
      uniquePairs.set(key, {
        player_id: item.player_id,
        competition_edition_id: item.competition_edition_id,
        season_name: item.season_name,
        competition_name: item.competition_name
      })
    }
  })

  return Array.from(uniquePairs.values())
}

export async function populatePhysicalData(seasonFilter?: string, competitionFilter?: string) {
  console.log('=== Fetching Physical Statistics ===\n')
  
  const filterDesc = []
  if (seasonFilter) filterDesc.push(`Season: ${seasonFilter}`)
  if (competitionFilter) filterDesc.push(`Competition: ${competitionFilter}`)
  console.log(filterDesc.length > 0 ? `Filters: ${filterDesc.join(', ')}` : 'Fetching for all seasons and competitions')
  
  // Get all unique player-competition_edition pairs
  const pairs = await getPlayerCompetitionPairs(seasonFilter, competitionFilter)
  console.log(`\nFound ${pairs.length} unique player-competition_edition combinations\n`)

  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i]
    const progress = `[${i + 1}/${pairs.length}]`
    
    try {
      console.log(`${progress} Fetching physical data for player ${pair.player_id} in competition edition ${pair.competition_edition_id}...`)
      
      await delay(DELAY_BETWEEN_REQUESTS)
      
      const data = await fetchPhysicalData(pair.player_id, pair.competition_edition_id)
      
      if (data.results.length === 0) {
        console.log(`  ⊘ No physical data available`)
        skippedCount++
        continue
      }

      console.log(`  Found ${data.results.length} position record(s)`)

      // Prepare records for insertion
      const recordsMap = new Map()
      
      data.results.forEach(result => {
        const key = `${result.player_id}-${pair.competition_edition_id}-${result.position}`
        
        // Only keep the first occurrence of each unique combination
        if (!recordsMap.has(key)) {
          recordsMap.set(key, {
            player_id: result.player_id,
            competition_edition_id: pair.competition_edition_id,
            position: result.position,
            player_name: result.player_name,
            player_short_name: result.player_short_name,
            player_birthdate: result.player_birthdate || null,
            team_id: result.team_id,
            team_name: result.team_name,
            season_id: result.season_id,
            season_name: result.season_name,
            competition_name: pair.competition_name,
            position_group: getPositionGroup(result.position),
            minutes_full_all: result.minutes_full_all,
            count_match: result.count_match,
            count_match_failed: result.count_match_failed,
            timetohsr_top3: result.timetohsr_top3,
            timetohsrpostcod_top3: result.timetohsrpostcod_top3,
            timetosprint_top3: result.timetosprint_top3,
            timetosprintpostcod_top3: result.timetosprintpostcod_top3,
            timeto505around90_top3: result.timeto505around90_top3,
            timeto505around180_top3: result.timeto505around180_top3,
            psv99: result.psv99,
            psv99_top5: result.psv99_top5,
            total_distance_full_all_p90: result.total_distance_full_all_p90,
            total_metersperminute_full_all_p90: result.total_metersperminute_full_all_p90,
            running_distance_full_all_p90: result.running_distance_full_all_p90,
            hsr_distance_full_all_p90: result.hsr_distance_full_all_p90,
            hsr_count_full_all_p90: result.hsr_count_full_all_p90,
            sprint_distance_full_all_p90: result.sprint_distance_full_all_p90,
            sprint_count_full_all_p90: result.sprint_count_full_all_p90,
            hi_distance_full_all_p90: result.hi_distance_full_all_p90,
            hi_count_full_all_p90: result.hi_count_full_all_p90,
            medaccel_count_full_all_p90: result.medaccel_count_full_all_p90,
            highaccel_count_full_all_p90: result.highaccel_count_full_all_p90,
            meddecel_count_full_all_p90: result.meddecel_count_full_all_p90,
            highdecel_count_full_all_p90: result.highdecel_count_full_all_p90,
            cod_count_full_all_p90: result.cod_count_full_all_p90,
            explacceltohsr_count_full_all_p90: result.explacceltohsr_count_full_all_p90,
            explacceltosprint_count_full_all_p90: result.explacceltosprint_count_full_all_p90
          })
        }
      })

      const records = Array.from(recordsMap.values())

      // Upsert records
      const { error } = await supabase
        .from('physical_p90')
        .upsert(records, {
          onConflict: 'player_id,competition_edition_id,position'
        })

      if (error) {
        console.error(`  ✗ Error inserting records:`, error)
        errorCount++
      } else {
        console.log(`  ✓ Inserted ${records.length} position record(s)`)
        successCount++
      }

    } catch (err) {
      console.error(`  ✗ Error:`, err)
      errorCount++
    }
  }

  console.log(`\n=== Physical Statistics Fetch Complete ===`)
  console.log(`Success: ${successCount}`)
  console.log(`Skipped (no data): ${skippedCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Total: ${pairs.length}`)
}
