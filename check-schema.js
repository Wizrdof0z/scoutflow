import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvijwjdsfrciqcflpevx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aWp3amRzZnJjaXFjZmxwZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjg3MzgsImV4cCI6MjA3ODY0NDczOH0.A9Jj6jxHeaW3A1FoyL8kb-wd4GhCpGuok8CqI16yeeo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking users table...\n')

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Sample user record:')
    console.log(data)
    if (data && data.length > 0) {
      console.log('\nColumn names:', Object.keys(data[0]))
    }
  }
}

checkSchema()
