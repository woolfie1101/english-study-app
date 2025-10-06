import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadAudioFiles() {
  const audioDir = path.join(__dirname, '../../영어표현/daily_expression_mp3')
  const bucketName = 'audio-files'

  // Read all MP3 files
  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'))
  console.log(`Found ${files.length} audio files`)

  // Upload each file
  for (const file of files) {
    const filePath = path.join(audioDir, file)
    const fileBuffer = fs.readFileSync(filePath)

    console.log(`Uploading ${file}...`)
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(file, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: true, // Overwrite if exists
      })

    if (error) {
      console.error(`✗ Error uploading ${file}:`, error)
    } else {
      console.log(`✓ Uploaded ${file}`)
    }
  }

  console.log('\n✓ All files uploaded successfully!')
  console.log(`\nPublic URL format: ${supabaseUrl}/storage/v1/object/public/audio-files/{filename}`)
}

uploadAudioFiles().catch(console.error)
