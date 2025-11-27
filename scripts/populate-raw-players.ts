import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SkillCorner API credentials
const SKILLCORNER_EMAIL = 'jquant90@gmail.com';
const SKILLCORNER_PASSWORD = 'Delepelaar6!';
const SKILLCORNER_API_URL = 'https://skillcorner.com/api/players/?competition_edition=1230';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SkillCornerPlayer {
  id: number;
  first_name: string;
  last_name: string;
  short_name: string;
  birthday: string;
  trackable_object?: number;
  gender?: string;
}

interface SkillCornerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SkillCornerPlayer[];
}

async function authenticateSkillCorner(): Promise<string> {
  console.log('🔐 Authenticating with SkillCorner...');
  
  // Try basic auth instead of token auth
  const credentials = btoa(`${SKILLCORNER_EMAIL}:${SKILLCORNER_PASSWORD}`);
  return credentials;
}

async function fetchPlayers(credentials: string, url: string): Promise<SkillCornerResponse> {
  console.log(`📡 Fetching players from: ${url}`);
  
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

async function insertPlayers(players: SkillCornerPlayer[]): Promise<void> {
  console.log(`💾 Inserting ${players.length} players into database...`);
  
  // Transform data to match our table schema (exclude trackable_object and gender, rename id to player_id)
  const transformedPlayers = players.map(player => ({
    player_id: player.id,
    first_name: player.first_name,
    last_name: player.last_name,
    short_name: player.short_name,
    birthday: player.birthday,
  }));

  // Insert in batches to avoid potential size limits
  const batchSize = 100;
  for (let i = 0; i < transformedPlayers.length; i += batchSize) {
    const batch = transformedPlayers.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('raw_players_league_edition')
      .upsert(batch, { onConflict: 'player_id' });

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} players)`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting player data population...\n');
    
    // Step 1: Get credentials
    const credentials = await authenticateSkillCorner();
    
    // Step 2: Fetch all players (handle pagination)
    let allPlayers: SkillCornerPlayer[] = [];
    let currentUrl: string | null = SKILLCORNER_API_URL;
    let pageCount = 0;
    
    while (currentUrl) {
      pageCount++;
      const response = await fetchPlayers(credentials, currentUrl);
      
      allPlayers = allPlayers.concat(response.results);
      console.log(`📄 Page ${pageCount}: ${response.results.length} players (Total: ${allPlayers.length}/${response.count})`);
      
      currentUrl = response.next;
      
      // Add a small delay between requests to be nice to the API
      if (currentUrl) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n📊 Total players fetched: ${allPlayers.length}`);
    
    // Step 3: Insert into database
    await insertPlayers(allPlayers);
    
    console.log('\n✅ SUCCESS! All players have been populated in raw_players_league_edition table');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
