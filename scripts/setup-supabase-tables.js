import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("🔧 Setting up Supabase database...")
console.log("URL:", supabaseUrl ? "✅ Found" : "❌ Missing")
console.log("Service Key:", supabaseServiceKey ? "✅ Found" : "❌ Missing")

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
  console.error("- SUPABASE_SERVICE_ROLE_KEY")
  console.error("\nPlease add these to your Vercel environment variables.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log("📋 Creating tables...")

  // Create consultation_evaluations table
  const { error: consultationError } = await supabase.rpc("sql", {
    query: `
      CREATE TABLE IF NOT EXISTS consultation_evaluations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        company_size VARCHAR(50) NOT NULL,
        current_challenge TEXT NOT NULL,
        process_type VARCHAR(100) NOT NULL,
        urgency VARCHAR(50),
        budget VARCHAR(50),
        expected_roi VARCHAR(50),
        estimated_min_price INTEGER,
        estimated_max_price INTEGER,
        estimated_duration VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  })

  if (consultationError) {
    console.error("❌ Error creating consultation_evaluations:", consultationError)
  } else {
    console.log("✅ consultation_evaluations table created")
  }

  // Create contact_submissions table
  const { error: contactError } = await supabase.rpc("sql", {
    query: `
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        consultation_id UUID REFERENCES consultation_evaluations(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        phone VARCHAR(50),
        service_type VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        meeting_time TIMESTAMPTZ,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  })

  if (contactError) {
    console.error("❌ Error creating contact_submissions:", contactError)
  } else {
    console.log("✅ contact_submissions table created")
  }

  // Create notifications_sent table
  const { error: notificationError } = await supabase.rpc("sql", {
    query: `
      CREATE TABLE IF NOT EXISTS notifications_sent (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        contact_id UUID REFERENCES contact_submissions(id),
        notification_type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        content TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'sent'
      );
    `,
  })

  if (notificationError) {
    console.error("❌ Error creating notifications_sent:", notificationError)
  } else {
    console.log("✅ notifications_sent table created")
  }

  // Create indexes
  console.log("🔍 Creating indexes...")

  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_consultation_evaluations_created_at ON consultation_evaluations(created_at);",
    "CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);",
    "CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);",
    "CREATE INDEX IF NOT EXISTS idx_notifications_sent_contact_id ON notifications_sent(contact_id);",
  ]

  for (const indexQuery of indexes) {
    const { error } = await supabase.rpc("sql", { query: indexQuery })
    if (error) {
      console.error("❌ Error creating index:", error)
    }
  }

  console.log("✅ Indexes created")

  // Test the tables
  console.log("🧪 Testing tables...")

  const { data: tables, error: testError } = await supabase
    .from("consultation_evaluations")
    .select("count", { count: "exact", head: true })

  if (testError) {
    console.error("❌ Error testing tables:", testError)
  } else {
    console.log("✅ Tables are working correctly")
  }

  console.log("🎉 Database setup complete!")
}

createTables().catch(console.error)
