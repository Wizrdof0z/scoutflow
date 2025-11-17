import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials
const supabaseUrl = 'https://dvijwjdsfrciqcflpevx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aWp3amRzZnJjaXFjZmxwZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjg3MzgsImV4cCI6MjA3ODY0NDczOH0.A9Jj6jxHeaW3A1FoyL8kb-wd4GhCpGuok8CqI16yeeo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to parse date
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Handle formats like "August 31, 2000"
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }
  return null;
}

// Helper function to parse market value
function parseMarketValue(valueStr) {
  if (!valueStr || valueStr.trim() === '') return null;
  
  // Remove € and commas, then parse
  const cleaned = valueStr.replace(/[€,]/g, '').trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

// Helper function to map position abbreviations to full positions
function mapPosition(posAbbr) {
  const mapping = {
    'GK': 'Goalkeeper',
    'CB': 'Centre Back',
    'LB': 'Left Fullback',
    'RB': 'Right Fullback',
    'DM': 'Defensive Midfielder',
    'CM': 'Central Midfielder',
    'AM': 'Attacking Midfielder',
    'LW': 'Left Winger',
    'RW': 'Right Winger',
    'CF': 'Centre Forward'
  };
  
  return mapping[posAbbr] || null;
}

// Helper function to determine current list based on Follow up action
function determineCurrentList(followUpAction, dataVerdict) {
  if (!followUpAction || followUpAction.trim() === '') {
    return 'Prospects';
  }
  
  const action = followUpAction.trim();
  
  if (action === 'Videoscouting') return 'Videoscouting list';
  if (action === 'Continue Monitoring') return 'Videoscouting list';
  if (action === 'Not Interesting') return 'Not interesting list';
  
  // If has data verdict, put in datascouting list
  if (dataVerdict && dataVerdict.trim() !== '') {
    return 'Datascouting list';
  }
  
  return 'Prospects';
}

// Helper function to generate player ID
function generatePlayerID(name, dateOfBirth) {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const date = new Date(dateOfBirth);
  const dateStr = date.toISOString().split('T')[0];
  return `${cleanName}-${dateStr}`;
}

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

async function importCSV() {
  try {
    // Read CSV file
    const csvContent = fs.readFileSync('Datascouting 29cf2c6c00a081e3bae2ce29f7306607.csv', 'utf-8');
    
    // Parse CSV
    const records = parseCSV(csvContent);
    
    console.log(`Found ${records.length} players in CSV`);
    
    // Get current season (2025-2026)
    const currentSeason = '2025-2026';
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const record of records) {
      try {
        const name = record['Name']?.trim();
        const dateOfBirth = parseDate(record['Date of Birth']);
        
        if (!name || !dateOfBirth) {
          console.log(`Skipping player - missing name or DOB: ${name || 'Unknown'}`);
          skipped++;
          continue;
        }
        
        const playerID = generatePlayerID(name, dateOfBirth);
        
        // Check if player already exists
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('player_id')
          .eq('player_id', playerID)
          .single();
        
        if (existingPlayer) {
          console.log(`Player already exists: ${name}`);
          skipped++;
          continue;
        }
        
        // Prepare player data
        const playerData = {
          player_id: playerID,
          name: name,
          date_of_birth: dateOfBirth,
          current_team: record['Team'] || 'Unknown',
          current_league: record['League'] || 'Unknown',
          matches_played: parseInt(record['Matches']) || 0,
          nationality: record['Nationality'] || 'Unknown',
          foot: record['Preferred Foot'] || 'Right', // Default to Right if not specified
          market_value: parseMarketValue(record['Market Value']),
          contract_end_date: parseDate(record['Contract Expires']),
          position_profile: mapPosition(record['Position']),
          data_available: record['Data available?'] === 'Yes',
          current_list: determineCurrentList(record['Follow up action'], record['Data Verdict'])
        };
        
        // Insert player
        const { error: playerError } = await supabase
          .from('players')
          .insert(playerData);
        
        if (playerError) {
          console.error(`Error inserting player ${name}:`, playerError);
          errors++;
          continue;
        }
        
        // Insert ratings if available
        const overallRating = parseFloat(record['Overall Rating']);
        const physicalRating = parseFloat(record['Physical Rating']);
        const movementRating = parseFloat(record['Movement Rating']);
        const passingRating = parseFloat(record['Passing Rating']);
        const pressureRating = parseFloat(record['Pressure Rating']);
        const defensiveRating = parseFloat(record['Defensive Rating']);
        
        if (!isNaN(overallRating)) {
          const ratingsData = {
            player_id: playerID,
            season_id: currentSeason,
            overall_rating: overallRating,
            physical_rating: isNaN(physicalRating) ? null : physicalRating,
            movement_rating: isNaN(movementRating) ? null : movementRating,
            passing_rating: isNaN(passingRating) ? null : passingRating,
            pressure_rating: isNaN(pressureRating) ? null : pressureRating,
            defensive_rating: isNaN(defensiveRating) ? null : defensiveRating
          };
          
          await supabase.from('player_ratings').insert(ratingsData);
        }
        
        // Insert data scouting entry if has data verdict
        const dataVerdict = record['Data Verdict']?.trim();
        if (dataVerdict && ['Good', 'Average', 'Bad'].includes(dataVerdict)) {
          const dataScoutingData = {
            player_id: playerID,
            season_id: currentSeason,
            data_verdict: dataVerdict,
            sub_profile: record['Position Profile'] || null
          };
          
          await supabase.from('data_scouting_entries').insert(dataScoutingData);
        }
        
        // Insert videoscouting entry if has verdicts
        const kyleVerdict = record['Verdict Kyle']?.trim();
        const toerVerdict = record['Verdict Toer']?.trim();
        
        if (kyleVerdict || toerVerdict) {
          const videoscoutingData = {
            player_id: playerID,
            season_id: currentSeason,
            kyle_verdict: kyleVerdict || null,
            toer_verdict: toerVerdict || null
          };
          
          await supabase.from('videoscouting_entries').insert(videoscoutingData);
        }
        
        console.log(`✓ Imported: ${name}`);
        imported++;
        
      } catch (error) {
        console.error(`Error processing player:`, error);
        errors++;
      }
    }
    
    console.log(`\n=== Import Complete ===`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run import
importCSV();
