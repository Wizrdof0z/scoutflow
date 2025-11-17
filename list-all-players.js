import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aaithpnjvijadxcsmzlh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaXRocG5qdmlqYWR4Y3NtemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzAzNTIsImV4cCI6MjA0NzQwNjM1Mn0.u98a4VVhfXs9P5Y-e2dZ2lhV9U5d8MScC-L8HmOEiIw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listPlayers() {
  const { data: players, error } = await supabase
    .from('players')
    .select('player_id, name')
    .order('name');
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log(`\nTotal players: ${players.length}\n`);
  
  // Group by name to find duplicates
  const nameMap = {};
  players.forEach(p => {
    if (!nameMap[p.name]) {
      nameMap[p.name] = [];
    }
    nameMap[p.name].push(p.player_id);
  });
  
  // Find duplicates
  console.log('DUPLICATE NAMES:');
  let foundDuplicates = false;
  Object.entries(nameMap).forEach(([name, ids]) => {
    if (ids.length > 1) {
      console.log(`\n${name}: ${ids.length} instances`);
      ids.forEach(id => console.log(`  - ${id}`));
      foundDuplicates = true;
    }
  });
  
  if (!foundDuplicates) {
    console.log('  None found!');
  }
}

listPlayers().catch(console.error);
