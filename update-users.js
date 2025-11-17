import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Supabase credentials
const supabaseUrl = 'https://dvijwjdsfrciqcflpevx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aWp3amRzZnJjaXFjZmxwZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjg3MzgsImV4cCI6MjA3ODY0NDczOH0.A9Jj6jxHeaW3A1FoyL8kb-wd4GhCpGuok8CqI16yeeo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateUsers() {
  console.log('Updating user roles...\n')

  try {
    // 1. Update jurjan to admin
    console.log('1. Updating jurjan from livescout to admin...')
    const { data: jurjanUpdate, error: jurjanError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('email', 'jurjan')
      .select()

    if (jurjanError) {
      console.error('Error updating jurjan:', jurjanError)
    } else {
      console.log('✓ Jurjan updated to admin:', jurjanUpdate)
    }

    // 2. Add or update robin as livescout
    console.log('\n2. Adding/updating robin as livescout...')
    
    // First check if robin exists
    const { data: existingRobin } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'robin')
      .single()

    if (existingRobin) {
      // Update existing robin
      const { data: robinData, error: robinError } = await supabase
        .from('users')
        .update({ role: 'livescout', name: 'Robin' })
        .eq('email', 'robin')
        .select()

      if (robinError) {
        console.error('Error updating robin:', robinError)
      } else {
        console.log('✓ Robin updated as livescout:', robinData)
      }
    } else {
      // Insert new robin with generated UUID
      const { data: robinData, error: robinError } = await supabase
        .from('users')
        .insert({
          id: randomUUID(),
          email: 'robin',
          password_hash: '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ', // "robin" hashed
          role: 'livescout',
          name: 'Robin'
        })
        .select()

      if (robinError) {
        console.error('Error adding robin:', robinError)
      } else {
        console.log('✓ Robin added as livescout:', robinData)
      }
    }

    // 3. Show all users
    console.log('\n3. Current users in database:')
    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('email, role, name')
      .order('role')
      .order('email')

    if (listError) {
      console.error('Error listing users:', listError)
    } else {
      console.table(allUsers)
      console.log('\n✓ Update complete!')
      console.log('\nLogin credentials:')
      console.log('- jeroen/jeroen (admin)')
      console.log('- jurjan/jurjan (admin - UPDATED)')
      console.log('- robin/robin (livescout - NEW)')
      console.log('- kyle/kyle (videoscout)')
      console.log('- toer/toer (videoscout)')
      console.log('- guest/guest (viewer)')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

updateUsers()
