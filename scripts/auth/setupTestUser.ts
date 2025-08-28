import { createClient } from "@supabase/supabase-js";

async function setupTestUser() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testEmail = "test@example.com";
  const testPassword = "test123";

  try {
    // Try to create the test user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (error && error.message.includes('User already registered')) {
      console.log("✅ Test user already exists in Supabase Auth");
    } else if (error) {
      throw error;
    } else {
      console.log("✅ Created test user in Supabase Auth:", data.user?.email);
    }
  } catch (error: any) {
    console.error("❌ Failed to setup test user:", error.message);
    throw error;
  }
}

if (require.main === module) {
  setupTestUser().catch(console.error);
}

export { setupTestUser };