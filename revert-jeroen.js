import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvijwjdsfrciqcflpevx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aWp3amRzZnJjaXFjZmxwZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjg3MzgsImV4cCI6MjA3ODY0NDczOH0.A9Jj6jxHeaW3A1FoyL8kb-wd4GhCpGuok8CqI16yeeo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function revertJeroen() {
  console.log('Changing jeroen back to datascout...\n')

  const { data, error } = await supabase
    .from('users')
    .update({ role: 'datascout' })
    .eq('email', 'jeroen')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✓ Jeroen changed back to datascout:', data)
  }

  // Show all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('email, role, name')
    .order('role')
    .order('email')

  console.log('\n✓ All users:')
  console.table(allUsers)
  
  console.log('\nCurrent roles:')
  console.log('- jeroen/jeroen (datascout)')
  console.log('- jurjan/jurjan (admin)')
  console.log('- robin/robin (livescout)')
}

revertJeroen()
