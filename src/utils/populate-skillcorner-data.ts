import { supabase } from '@/lib/supabase';

// SkillCorner API configuration
const SKILLCORNER_API_BASE = 'https://skillcorner.com/api';
const SKILLCORNER_AUTH = {
  username: 'jquant90@gmail.com',
  password: 'Delepelaar6!',
};

// Rate limiting configuration
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second between requests
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API request with basic auth
async function fetchFromSkillCorner(endpoint: string) {
  const authHeader = 'Basic ' + btoa(`${SKILLCORNER_AUTH.username}:${SKILLCORNER_AUTH.password}`);
  
  console.log(`Fetching: ${SKILLCORNER_API_BASE}${endpoint}`);
  
  const response = await fetch(`${SKILLCORNER_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': authHeader,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error Response:`, errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Fetch and populate competition editions
export async function populateCompetitionEditions() {
  console.log('Fetching competition editions...');
  
  const data = await fetchFromSkillCorner('/competition_editions/?user=true');
  
  console.log(`Found ${data.count} competition editions`);
  
  for (const item of data.results) {
    const { error } = await supabase
      .from('competition_editions')
      .upsert({
        competition_edition_id: item.id,
        competition_id: item.competition.id,
        competition_area: item.competition.area,
        competition_name: item.competition.name,
        season_id: item.season.id,
        season_name: item.season.name,
        competition_edition_name: item.name,
      }, {
        onConflict: 'competition_edition_id',
      });

    if (error) {
      console.error(`Error inserting competition edition ${item.id}:`, error);
    } else {
      console.log(`✓ Inserted competition edition: ${item.name}`);
    }
  }
  
  return data.results;
}

// Fetch and populate teams for a competition edition
async function populateTeams(competitionEditionId: number, competitionId: number, competitionName: string, seasonName: string) {
  console.log(`\nFetching teams for competition edition ${competitionEditionId}...`);
  
  await delay(DELAY_BETWEEN_REQUESTS);
  
  const data = await fetchFromSkillCorner(`/teams/?competition_edition=${competitionEditionId}&user=true`);
  
  console.log(`Found ${data.count} teams`);
  
  for (const team of data.results) {
    const { error } = await supabase
      .from('teams')
      .upsert({
        competition_edition_id: competitionEditionId,
        competition_name: competitionName,
        competition_id: competitionId,
        team_id: team.id,
        team_name: team.name,
        stadium_id: team.stadium?.id || null,
        stadium_name: team.stadium?.name || null,
        stadium_city: team.stadium?.city || null,
        stadium_capacity: team.stadium?.capacity || null,
        season_name: seasonName,
      }, {
        onConflict: 'team_id',
      });

    if (error) {
      console.error(`Error inserting team ${team.id}:`, error);
    } else {
      console.log(`  ✓ Inserted team: ${team.name}`);
    }
  }
  
  return data.results;
}

// Fetch and populate players for a team and competition edition
async function populatePlayers(teamId: number, teamName: string, competitionEditionId: number, competitionName: string, seasonName: string) {
  console.log(`    Fetching players for team ${teamId}...`);
  
  await delay(DELAY_BETWEEN_REQUESTS);
  
  const data = await fetchFromSkillCorner(`/players/?team=${teamId}&competition_edition=${competitionEditionId}`);
  
  console.log(`    Found ${data.count} players`);
  
  // Validate and prepare players for batch insert
  const validPlayers = [];
  const skippedPlayers = [];
  
  for (const player of data.results) {
    // Check for required fields
    if (!player.id || !player.first_name || !player.last_name || !player.short_name) {
      skippedPlayers.push({
        id: player.id || 'unknown',
        name: player.short_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || 'Unknown',
        reason: 'Missing required fields'
      });
      continue;
    }
    
    validPlayers.push({
      player_id: player.id,
      team_id: teamId,
      team_name: teamName,
      competition_edition_id: competitionEditionId,
      competition_name: competitionName,
      season_name: seasonName,
      first_name: player.first_name,
      last_name: player.last_name,
      short_name: player.short_name,
      birthday: player.birthday || null,
    });
  }
  
  // Report skipped players
  if (skippedPlayers.length > 0) {
    console.warn(`      ⚠ Skipped ${skippedPlayers.length} invalid player(s):`);
    skippedPlayers.forEach(p => console.warn(`        - ${p.name} (ID: ${p.id}): ${p.reason}`));
  }
  
  // Batch insert valid players
  if (validPlayers.length > 0) {
    const { error } = await supabase
      .from('player')
      .upsert(validPlayers, {
        onConflict: 'player_id,team_id,competition_edition_id',
      });

    if (error) {
      console.error(`      ✗ Error batch inserting players:`, error);
    } else {
      console.log(`      ✓ Inserted ${validPlayers.length} player(s)`);
    }
  }
}

// Fetch all teams for all competition editions
export async function populateAllTeams() {
  console.log('=== Fetching All Teams ===\n');
  
  // Get all competition editions from database
  const { data: editions, error } = await supabase
    .from('competition_editions')
    .select('*');
  
  if (error) {
    throw new Error(`Failed to fetch competition editions: ${error.message}`);
  }
  
  if (!editions || editions.length === 0) {
    throw new Error('No competition editions found. Please fetch competition editions first.');
  }
  
  console.log(`Found ${editions.length} competition editions`);
  
  for (const edition of editions) {
    await populateTeams(
      edition.competition_edition_id,
      edition.competition_id,
      edition.competition_name,
      edition.season_name
    );
    await delay(DELAY_BETWEEN_BATCHES);
  }
  
  console.log('\n=== All Teams Fetched ===');
}

// Fetch players for a specific season
export async function populatePlayersForSeason(seasonName: string) {
  console.log(`=== Fetching Players for Season: ${seasonName} ===\n`);
  
  // Get all teams for the specified season
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('season_name', seasonName);
  
  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }
  
  if (!teams || teams.length === 0) {
    throw new Error(`No teams found for season ${seasonName}`);
  }
  
  console.log(`Found ${teams.length} teams in season ${seasonName}`);
  
  for (const team of teams) {
    await populatePlayers(
      team.team_id,
      team.team_name,
      team.competition_edition_id,
      team.competition_name,
      team.season_name
    );
    await delay(DELAY_BETWEEN_REQUESTS);
  }
  
  console.log(`\n=== Players Fetched for Season ${seasonName} ===`);
}

// Main population function
export async function populateSkillCornerData() {
  console.log('=== Starting SkillCorner Data Population ===\n');
  const startTime = Date.now();
  
  try {
    // Step 1: Populate competition editions
    const competitionEditions = await populateCompetitionEditions();
    
    await delay(DELAY_BETWEEN_BATCHES);
    
    // Step 2: For each competition edition, populate teams
    for (const edition of competitionEditions) {
      const teams = await populateTeams(
        edition.id,
        edition.competition.id,
        edition.competition.name,
        edition.season.name
      );
      
      await delay(DELAY_BETWEEN_BATCHES);
      
      // Step 3: For each team, populate players
      for (const team of teams) {
        await populatePlayers(
          team.id,
          team.name,
          edition.id,
          edition.competition.name,
          edition.season.name
        );
      }
      
      await delay(DELAY_BETWEEN_BATCHES);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n=== Population Complete! (${duration}s) ===`);
    
    return { success: true, duration };
  } catch (error) {
    console.error('\n=== Population Failed ===');
    console.error(error);
    throw error;
  }
}
