#!/usr/bin/env tsx

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_EXPORT_DISABLED = process.env.GOOGLE_EXPORT_DISABLED === 'true';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

interface TestUser {
  id: string;
  email: string;
  accessToken: string;
}

class E2ESmokeTest {
  private supabase: SupabaseClient;
  private testUser: TestUser | null = null;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }

  async setupTestUser(): Promise<TestUser> {
    console.log('👤 Setting up test user...');
    
    const email = `smoke-test-${nanoid(8)}@example.com`;
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password: 'smoke-test-password-123',
      email_confirm: true
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }

    // Generate access token for API calls
    const { data: session, error: sessionError } = await this.supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`);
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      accessToken: session.properties?.access_token || ''
    };
  }

  async cleanupTestUser(): Promise<void> {
    if (this.testUser) {
      await this.supabase.auth.admin.deleteUser(this.testUser.id);
    }
  }

  async apiRequest(method: string, path: string, body?: any, headers: Record<string, string> = {}): Promise<any> {
    const url = `${API_BASE_URL}${path}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.testUser?.accessToken || ''}`,
      ...headers
    };

    const options = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    };

    // Use node-fetch or similar for Node.js environment
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options as any);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      throw new Error(`API ${method} ${path} failed: ${response.status} ${responseData.error?.message || responseData}`);
    }

    return responseData;
  }

  async testHealthEndpoints(): Promise<boolean> {
    console.log('🏥 Testing health endpoints...');
    
    try {
      // Test /healthz
      const health = await this.apiRequest('GET', '/healthz');
      if (health.status !== 'ok') {
        throw new Error('Health check failed');
      }
      console.log('  ✅ /healthz endpoint working');

      // Test /readyz
      const readiness = await this.apiRequest('GET', '/readyz');
      if (readiness.status !== 'ready') {
        throw new Error('Readiness check failed');
      }
      console.log('  ✅ /readyz endpoint working');

      return true;
    } catch (error) {
      console.error(`  ❌ Health endpoints failed: ${error}`);
      return false;
    }
  }

  async testProjectCreation(): Promise<string | null> {
    console.log('📁 Testing project creation...');
    
    try {
      const projectData = {
        name: `Smoke Test Project ${nanoid(6)}`,
        description: 'End-to-end smoke test project'
      };

      const project = await this.apiRequest('POST', '/api/projects', projectData);
      
      if (!project.id) {
        throw new Error('Project creation returned no ID');
      }

      console.log(`  ✅ Project created: ${project.id}`);
      return project.id;
    } catch (error) {
      console.error(`  ❌ Project creation failed: ${error}`);
      return null;
    }
  }

  async testCaptureUpload(projectId: string): Promise<string | null> {
    console.log('📸 Testing capture upload...');
    
    try {
      // Create a tiny test image (1x1 PNG)
      const tinyPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x5C, 0xC5, 0x8E, 0x8B, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);

      const formData = new FormData();
      const blob = new Blob([tinyPng], { type: 'image/png' });
      formData.append('file', blob, 'test.png');
      formData.append('projectId', projectId);

      const response = await fetch(`${API_BASE_URL}/api/captures/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.testUser?.accessToken || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      console.log(`  ✅ Capture uploaded: ${result.id}`);
      return result.id;
    } catch (error) {
      console.error(`  ❌ Capture upload failed: ${error}`);
      return null;
    }
  }

  async testBriefCreation(projectId: string): Promise<string | null> {
    console.log('📝 Testing brief creation...');
    
    try {
      const briefData = {
        title: `Smoke Test Brief ${nanoid(6)}`,
        description: 'End-to-end smoke test brief',
        projectId,
        status: 'draft'
      };

      const brief = await this.apiRequest('POST', '/api/briefs', briefData);
      
      if (!brief.id) {
        throw new Error('Brief creation returned no ID');
      }

      console.log(`  ✅ Brief created: ${brief.id}`);
      return brief.id;
    } catch (error) {
      console.error(`  ❌ Brief creation failed: ${error}`);
      return null;
    }
  }

  async testBriefCanvas(briefId: string, captureId?: string): Promise<boolean> {
    console.log('🎨 Testing brief canvas operations...');
    
    try {
      // Add a text block
      const textBlock = {
        type: 'text',
        content: 'This is a smoke test text block',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 50 }
      };

      const textResult = await this.apiRequest('POST', `/api/briefs/${briefId}/blocks`, textBlock);
      console.log(`  ✅ Text block added: ${textResult.id}`);

      // Add an image block if we have a capture
      if (captureId) {
        const imageBlock = {
          type: 'capture_ref',
          content: captureId,
          position: { x: 100, y: 200 },
          size: { width: 150, height: 150 }
        };

        const imageResult = await this.apiRequest('POST', `/api/briefs/${briefId}/blocks`, imageBlock);
        console.log(`  ✅ Image block added: ${imageResult.id}`);
      }

      // Read back the brief to verify blocks persisted
      const briefWithBlocks = await this.apiRequest('GET', `/api/briefs/${briefId}`);
      if (!briefWithBlocks.blocks || briefWithBlocks.blocks.length === 0) {
        throw new Error('Brief blocks were not persisted');
      }

      console.log(`  ✅ Brief canvas working (${briefWithBlocks.blocks.length} blocks)`);
      return true;
    } catch (error) {
      console.error(`  ❌ Brief canvas failed: ${error}`);
      return false;
    }
  }

  async testExportFunctionality(briefId: string): Promise<boolean> {
    console.log('📤 Testing export functionality...');
    
    if (GOOGLE_EXPORT_DISABLED) {
      console.log('  ⏭️ Google export disabled, skipping...');
      return true;
    }

    try {
      const exportResult = await this.apiRequest('POST', `/api/briefs/${briefId}/export/slides`);
      
      if (exportResult.status === 'queued' || exportResult.status === 'completed') {
        console.log('  ✅ Export functionality working');
        return true;
      } else {
        throw new Error(`Unexpected export status: ${exportResult.status}`);
      }
    } catch (error) {
      console.error(`  ❌ Export functionality failed: ${error}`);
      return false;
    }
  }

  async runSmokeTest(): Promise<boolean> {
    console.log('🔥 Starting End-to-End Smoke Test\n');
    
    const results: boolean[] = [];

    try {
      this.testUser = await this.setupTestUser();
      console.log(`✅ Test user created: ${this.testUser.email}\n`);

      // Run all tests
      results.push(await this.testHealthEndpoints());
      
      const projectId = await this.testProjectCreation();
      if (projectId) {
        const captureId = await this.testCaptureUpload(projectId);
        
        const briefId = await this.testBriefCreation(projectId);
        if (briefId) {
          results.push(await this.testBriefCanvas(briefId, captureId || undefined));
          results.push(await this.testExportFunctionality(briefId));
        } else {
          results.push(false, false);
        }
      } else {
        results.push(false, false, false);
      }

      const allPassed = results.every(r => r);

      console.log('\n📊 Smoke Test Results:');
      console.log(`   Health Endpoints: ${results[0] ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Brief Canvas:     ${results[1] ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Export:           ${results[2] ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Overall:          ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

      if (allPassed) {
        console.log('\n🎉 E2E Smoke Test PASSED!');
      } else {
        console.log('\n💥 E2E Smoke Test FAILED!');
      }

      return allPassed;

    } finally {
      await this.cleanupTestUser();
    }
  }
}

async function main() {
  const smokeTest = new E2ESmokeTest();
  const success = await smokeTest.runSmokeTest();
  process.exit(success ? 0 : 1);
}

// ESM module entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Smoke test failed:', error);
    process.exit(1);
  });
}