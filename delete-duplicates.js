import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aaithpnjvijadxcsmzlh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaXRocG5qdmlqYWR4Y3NtemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzAzNTIsImV4cCI6MjA0NzQwNjM1Mn0.u98a4VVhfXs9P5Y-e2dZ2lhV9U5d8MScC-L8HmOEiIw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicatesWithLeastData() {
  const names = ['Felix Tomi', 'Joao Silva', 'Efe Korkut', 'Kasey Bos'];
  const toDelete = [];
  
  for (const name of names) {
    console.log('\n' + '='.repeat(50));
    console.log('Checking:', name);
    
    // Get all players with this name
    const { data: players, error } = await supabase
      .from('players')
      .select('player_id, name, date_of_birth, current_team, market_value, created_at')
      .ilike('name', name);
    
    if (error || !players || players.length < 2) {
      console.log('  Skipping - not a duplicate or error');
      continue;
    }
    
    console.log(`  Found ${players.length} instances`);
    
    // Check data for each instance
    const playersWithData = [];
    
    for (const player of players) {
      const [ratings, dataEntries, videoEntries, liveEntries, reports] = await Promise.all([
        supabase.from('player_ratings').select('*').eq('player_id', player.player_id),
        supabase.from('data_scouting_entries').select('*').eq('player_id', player.player_id),
        supabase.from('videoscouting_entries').select('*').eq('player_id', player.player_id),
        supabase.from('live_scouting_entries').select('*').eq('player_id', player.player_id),
        supabase.from('reports').select('*').eq('player_id', player.player_id)
      ]);
      
      const totalData = (ratings.data?.length || 0) + 
                       (dataEntries.data?.length || 0) + 
                       (videoEntries.data?.length || 0) + 
                       (liveEntries.data?.length || 0) + 
                       (reports.data?.length || 0);
      
      playersWithData.push({
        ...player,
        totalData,
        ratings: ratings.data?.length || 0,
        dataEntries: dataEntries.data?.length || 0,
        videoEntries: videoEntries.data?.length || 0,
        liveEntries: liveEntries.data?.length || 0,
        reports: reports.data?.length || 0
      });
    }
    
    // Sort by total data (ascending) - the one with least data will be first
    playersWithData.sort((a, b) => a.totalData - b.totalData);
    
    // Mark the first one (least data) for deletion
    const playerToDelete = playersWithData[0];
    console.log('  Will delete:', playerToDelete.player_id);
    console.log('    Total data:', playerToDelete.totalData);
    console.log('    Created:', playerToDelete.created_at);
    console.log('  Will keep:', playersWithData[1].player_id);
    console.log('    Total data:', playersWithData[1].totalData);
    console.log('    Created:', playersWithData[1].created_at);
    
    toDelete.push(playerToDelete.player_id);
  }
  
  // Now delete the duplicates
  if (toDelete.length > 0) {
    console.log('\n' + '='.repeat(50));
    console.log('DELETING', toDelete.length, 'duplicate(s)...');
    console.log('Player IDs to delete:', toDelete);
    
    for (const playerId of toDelete) {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('player_id', playerId);
      
      if (error) {
        console.error('  Error deleting', playerId, ':', error.message);
      } else {
        console.log('  ✓ Deleted', playerId);
      }
    }
    
    console.log('\nDone!');
  } else {
    console.log('\nNo duplicates found to delete.');
  }
}

deleteDuplicatesWithLeastData().catch(console.error);
