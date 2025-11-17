const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aaithpnjvijadxcsmzlh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaXRocG5qdmlqYWR4Y3NtemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzAzNTIsImV4cCI6MjA0NzQwNjM1Mn0.u98a4VVhfXs9P5Y-e2dZ2lhV9U5d8MScC-L8HmOEiIw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findDuplicates() {
  const names = ['Felix Tomi', 'Joao Silva', 'Efe Korkut', 'Kasey Bos'];
  
  for (const name of names) {
    console.log('\n' + '='.repeat(50));
    console.log('=== ' + name + ' ===');
    console.log('='.repeat(50));
    
    // Get all players with this name
    const { data: players, error } = await supabase
      .from('players')
      .select('player_id, name, date_of_birth, current_team, market_value, created_at')
      .ilike('name', name);
    
    if (error) {
      console.error('Error:', error.message);
      continue;
    }
    
    if (!players || players.length === 0) {
      console.log('No players found');
      continue;
    }
    
    console.log(`\nFound ${players.length} player(s) with name "${name}"\n`);
    
    for (const player of players) {
      console.log('\n--- Instance ---');
      console.log('Player ID:', player.player_id);
      console.log('DOB:', player.date_of_birth);
      console.log('Team:', player.current_team);
      console.log('Market Value:', player.market_value);
      console.log('Created At:', player.created_at);
      
      // Check for data in related tables
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
      
      console.log('Data counts:');
      console.log('  - Ratings:', ratings.data?.length || 0);
      console.log('  - Data entries:', dataEntries.data?.length || 0);
      console.log('  - Video entries:', videoEntries.data?.length || 0);
      console.log('  - Live entries:', liveEntries.data?.length || 0);
      console.log('  - Reports:', reports.data?.length || 0);
      console.log('  TOTAL DATA:', totalData);
      
      if (totalData === 0) {
        console.log('  >>> CANDIDATE FOR DELETION (no data) <<<');
      }
    }
  }
}

findDuplicates().catch(console.error);
