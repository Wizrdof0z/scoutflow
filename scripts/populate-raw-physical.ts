import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SkillCorner API credentials
const SKILLCORNER_EMAIL = 'jquant90@gmail.com';
const SKILLCORNER_PASSWORD = 'Delepelaar6!';
const SKILLCORNER_API_URL = 'https://skillcorner.com/api/physical/?competition_edition=1230&results=win,lose,draw&venue=home,away&period=full&possession=all&physical_check_passed=true&response_format=json';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SkillCornerPhysicalData {
  player_name: string;
  player_short_name: string;
  player_id: number;
  player_birthdate: string;
  team_name: string;
  team_id: number;
  match_name: string;
  match_id: number;
  match_date: string;
  competition_name: string;
  competition_id: number;
  season_name: string;
  season_id: number;
  competition_edition_id: number;
  position: string;
  position_group: string;
  minutes_full_all: number;
  physical_check_passed: boolean;
  total_distance_full_all: number;
  total_metersperminute_full_all: number;
  running_distance_full_all: number;
  hsr_distance_full_all: number;
  hsr_count_full_all: number;
  sprint_distance_full_all: number;
  sprint_count_full_all: number;
  hi_distance_full_all: number;
  hi_count_full_all: number;
  medaccel_count_full_all: number;
  highaccel_count_full_all: number;
  meddecel_count_full_all: number;
  highdecel_count_full_all: number;
  explacceltohsr_count_full_all: number;
  timetohsr: number | null;
  explacceltosprint_count_full_all: number;
  timetosprint: number | null;
  psv99: number;
}

interface SkillCornerResponse {
  results: SkillCornerPhysicalData[];
}

function authenticateSkillCorner(): string {
  console.log('🔐 Authenticating with SkillCorner...');
  const credentials = btoa(`${SKILLCORNER_EMAIL}:${SKILLCORNER_PASSWORD}`);
  return credentials;
}

async function fetchPhysicalData(credentials: string, url: string): Promise<SkillCornerResponse> {
  console.log(`📡 Fetching physical data from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

function transformPhysicalData(data: SkillCornerPhysicalData) {
  // Strip "_full_all" suffix from all attribute names
  return {
    player_name: data.player_name,
    player_short_name: data.player_short_name,
    player_id: data.player_id,
    player_birthdate: data.player_birthdate,
    team_name: data.team_name,
    team_id: data.team_id,
    match_name: data.match_name,
    match_id: data.match_id,
    match_date: data.match_date,
    competition_name: data.competition_name,
    competition_id: data.competition_id,
    season_name: data.season_name,
    season_id: data.season_id,
    competition_edition_id: data.competition_edition_id,
    position: data.position,
    position_group: data.position_group,
    minutes: data.minutes_full_all,
    physical_check_passed: data.physical_check_passed,
    total_distance: data.total_distance_full_all,
    total_metersperminute: data.total_metersperminute_full_all,
    running_distance: data.running_distance_full_all,
    hsr_distance: data.hsr_distance_full_all,
    hsr_count: data.hsr_count_full_all,
    sprint_distance: data.sprint_distance_full_all,
    sprint_count: data.sprint_count_full_all,
    hi_distance: data.hi_distance_full_all,
    hi_count: data.hi_count_full_all,
    medaccel_count: data.medaccel_count_full_all,
    highaccel_count: data.highaccel_count_full_all,
    meddecel_count: data.meddecel_count_full_all,
    highdecel_count: data.highdecel_count_full_all,
    explacceltohsr_count: data.explacceltohsr_count_full_all,
    timetohsr: data.timetohsr,
    explacceltosprint_count: data.explacceltosprint_count_full_all,
    timetosprint: data.timetosprint,
    psv99: data.psv99,
  };
}

async function insertPhysicalData(physicalData: SkillCornerPhysicalData[]): Promise<void> {
  console.log(`💾 Inserting ${physicalData.length} physical records into database...`);
  
  // Transform data to strip "_full_all" suffix
  const transformedData = physicalData.map(transformPhysicalData);

  // Insert in batches to avoid potential size limits
  const batchSize = 100;
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('raw_physical_league_edition')
      .insert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting physical data population...\n');
    
    // Step 1: Get credentials
    const credentials = authenticateSkillCorner();
    
    // Step 2: Fetch physical data
    console.log('📊 Fetching physical data from SkillCorner API...');
    const response = await fetchPhysicalData(credentials, SKILLCORNER_API_URL);
    
    console.log(`📊 Total physical records fetched: ${response.results.length}`);
    
    // Step 3: Insert into database
    await insertPhysicalData(response.results);
    
    console.log('\n✅ SUCCESS! All physical data has been populated in raw_physical_league_edition table');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
