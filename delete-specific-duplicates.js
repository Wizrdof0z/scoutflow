import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aaithpnjvijadxcsmzlh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaXRocG5qdmlqYWR4Y3NtemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzAzNTIsImV4cCI6MjA0NzQwNjM1Mn0.u98a4VVhfXs9P5Y-e2dZ2lhV9U5d8MScC-L8HmOEiIw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicates() {
  // Based on the screenshots, delete the ones with less data
  const toDelete = [
    { name: 'Kasey Bos', contractDate: '2029-06-30' },
    { name: 'Joao Silva', contractDate: '2026-06-30' },
    { name: 'Efe Korkut', contractDate: '2026-06-30' }
  ];
  
  // Also check for Félix with accent
  const felixVariants = ['Felix Tomi', 'Félix Tomi'];
  
  console.log('Deleting duplicates with less data...\n');
  
  // Delete the specific ones
  for (const item of toDelete) {
    console.log(`Looking for: ${item.name} with contract ${item.contractDate}`);
    
    const { data: players, error: selectError } = await supabase
      .from('players')
      .select('player_id, name, contract_end_date')
      .eq('name', item.name)
      .eq('contract_end_date', item.contractDate);
    
    if (selectError) {
      console.error(`  Error finding player: ${selectError.message}`);
      continue;
    }
    
    if (!players || players.length === 0) {
      console.log(`  Not found - skipping`);
      continue;
    }
    
    for (const player of players) {
      console.log(`  Found: ${player.player_id}`);
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('player_id', player.player_id);
      
      if (deleteError) {
        console.error(`    ✗ Error deleting: ${deleteError.message}`);
      } else {
        console.log(`    ✓ Deleted successfully`);
      }
    }
  }
  
  // Handle Felix/Félix
  console.log(`\nLooking for Felix Tomi variants with contract 2026-06-30`);
  for (const name of felixVariants) {
    const { data: players, error: selectError } = await supabase
      .from('players')
      .select('player_id, name, contract_end_date')
      .eq('name', name)
      .eq('contract_end_date', '2026-06-30');
    
    if (selectError) {
      console.error(`  Error finding ${name}: ${selectError.message}`);
      continue;
    }
    
    if (players && players.length > 0) {
      for (const player of players) {
        console.log(`  Found: ${player.name} (${player.player_id})`);
        const { error: deleteError } = await supabase
          .from('players')
          .delete()
          .eq('player_id', player.player_id);
        
        if (deleteError) {
          console.error(`    ✗ Error deleting: ${deleteError.message}`);
        } else {
          console.log(`    ✓ Deleted successfully`);
        }
      }
    }
  }
  
  console.log('\nDone!');
}

deleteDuplicates().catch(console.error);
