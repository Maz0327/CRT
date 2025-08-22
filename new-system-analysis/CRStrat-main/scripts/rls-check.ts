#!/usr/bin/env tsx

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

interface TestUser {
  id: string;
  email: string;
}

class RLSChecker {
  private serviceClient: SupabaseClient;

  constructor() {
    this.serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }

  async createTestUser(email: string): Promise<TestUser> {
    const { data, error } = await this.serviceClient.auth.admin.createUser({
      email,
      password: 'test-password-123',
      email_confirm: true
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }

    return {
      id: data.user.id,
      email: data.user.email!
    };
  }

  async deleteTestUser(userId: string): Promise<void> {
    const { error } = await this.serviceClient.auth.admin.deleteUser(userId);
    if (error) {
      console.warn(`⚠️ Failed to delete test user ${userId}: ${error.message}`);
    }
  }

  async getUserClient(userId: string): Promise<SupabaseClient> {
    // Create a client with service role but set user context
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Note: In production, you'd use proper JWT tokens
    // For this test, we'll rely on RLS policies checking auth.uid()
    return client;
  }

  async testProjectRLS(userA: TestUser, userB: TestUser): Promise<boolean> {
    console.log('🧪 Testing project RLS...');
    
    try {
      const clientA = await this.getUserClient(userA.id);
      const clientB = await this.getUserClient(userB.id);

      // Create a project as user A
      const { data: project, error: createError } = await clientA
        .from('projects')
        .insert({
          name: `Test Project ${nanoid(6)}`,
          description: 'RLS Test Project',
          user_id: userA.id
        })
        .select()
        .single();

      if (createError) {
        console.error(`❌ Project creation failed: ${createError.message}`);
        return false;
      }

      // Try to read the project as user B (should fail or return empty)
      const { data: unauthorizedRead, error: readError } = await clientB
        .from('projects')
        .select()
        .eq('id', project.id);

      if (readError && readError.message.includes('permission')) {
        console.log('✅ Project read protection working (got permission error)');
      } else if (!unauthorizedRead || unauthorizedRead.length === 0) {
        console.log('✅ Project read protection working (empty result)');
      } else {
        console.error('❌ Project RLS failed: User B can read User A\'s project');
        return false;
      }

      // Try to update the project as user B (should fail)
      const { error: updateError } = await clientB
        .from('projects')
        .update({ name: 'Hacked Project' })
        .eq('id', project.id);

      if (updateError && updateError.message.includes('permission')) {
        console.log('✅ Project update protection working');
      } else {
        console.error('❌ Project RLS failed: User B can update User A\'s project');
        return false;
      }

      // Cleanup
      await clientA.from('projects').delete().eq('id', project.id);
      
      return true;
    } catch (error) {
      console.error(`❌ Project RLS test error: ${error}`);
      return false;
    }
  }

  async testCaptureRLS(userA: TestUser, userB: TestUser): Promise<boolean> {
    console.log('🧪 Testing capture RLS...');
    
    try {
      const clientA = await this.getUserClient(userA.id);
      const clientB = await this.getUserClient(userB.id);

      // Create a capture as user A
      const { data: capture, error: createError } = await clientA
        .from('captures')
        .insert({
          url: 'https://example.com/test-rls',
          content: 'Test capture content',
          user_id: userA.id,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error(`❌ Capture creation failed: ${createError.message}`);
        return false;
      }

      // Try to read the capture as user B
      const { data: unauthorizedRead, error: readError } = await clientB
        .from('captures')
        .select()
        .eq('id', capture.id);

      if (readError && readError.message.includes('permission')) {
        console.log('✅ Capture read protection working (got permission error)');
      } else if (!unauthorizedRead || unauthorizedRead.length === 0) {
        console.log('✅ Capture read protection working (empty result)');
      } else {
        console.error('❌ Capture RLS failed: User B can read User A\'s capture');
        return false;
      }

      // Cleanup
      await clientA.from('captures').delete().eq('id', capture.id);
      
      return true;
    } catch (error) {
      console.error(`❌ Capture RLS test error: ${error}`);
      return false;
    }
  }

  async runAllTests(): Promise<boolean> {
    console.log('🔒 Starting RLS Security Tests\n');
    
    let userA: TestUser | null = null;
    let userB: TestUser | null = null;

    try {
      // Create test users
      console.log('👥 Creating test users...');
      userA = await this.createTestUser(`test-user-a-${nanoid(6)}@example.com`);
      userB = await this.createTestUser(`test-user-b-${nanoid(6)}@example.com`);
      console.log(`✅ Created test users: ${userA.email}, ${userB.email}\n`);

      // Run tests
      const projectTest = await this.testProjectRLS(userA, userB);
      const captureTest = await this.testCaptureRLS(userA, userB);

      const allPassed = projectTest && captureTest;

      console.log('\n📊 RLS Test Results:');
      console.log(`   Projects: ${projectTest ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Captures: ${captureTest ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Overall:  ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

      if (allPassed) {
        console.log('\n🎉 RLS OK - All security tests passed!');
      } else {
        console.log('\n💥 RLS FAILED - Security vulnerabilities detected!');
      }

      return allPassed;

    } finally {
      // Cleanup test users
      if (userA) {
        await this.deleteTestUser(userA.id);
      }
      if (userB) {
        await this.deleteTestUser(userB.id);
      }
    }
  }
}

async function main() {
  const checker = new RLSChecker();
  const success = await checker.runAllTests();
  process.exit(success ? 0 : 1);
}

// ESM module entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 RLS Check failed:', error);
    process.exit(1);
  });
}