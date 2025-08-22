#!/usr/bin/env tsx
// Smoke Test: Capture Analysis Integration (Task Block #5)
// Tests the complete upload → analyze → auto-tag workflow

import axios from 'axios';
import FormData from 'form-data';
import { Buffer } from 'buffer';

const API_BASE = process.env.API_BASE || 'http://localhost:5000';

// Test credentials - you may need to get real auth token
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'test-token';

// Tiny test image (1x1 pixel PNG)
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const TEST_IMAGE_BUFFER = Buffer.from(TEST_IMAGE_BASE64, 'base64');

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

class SmokeTestRunner {
  private results: TestResult[] = [];
  private captureId?: string;
  private analysisId?: string;

  private log(message: string) {
    console.log(`[SMOKE TEST] ${message}`);
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ name, passed: true, duration });
      this.log(`✅ ${name} (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({ name, passed: false, error: error.message, duration });
      this.log(`❌ ${name} (${duration}ms): ${error.message}`);
    }
  }

  async testUploadAndAnalyze(): Promise<void> {
    const form = new FormData();
    form.append('file', TEST_IMAGE_BUFFER, {
      filename: 'test-smoke.png',
      contentType: 'image/png'
    });
    form.append('title', 'Smoke Test Image');
    form.append('platform', 'test');
    form.append('mode', 'sync'); // Force sync mode for faster testing

    const response = await axios.post(
      `${API_BASE}/api/captures/upload-and-analyze`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        },
        timeout: 30000 // 30 second timeout
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const result = response.data;
    if (!result.captureId || !result.analysisId) {
      throw new Error('Missing captureId or analysisId in response');
    }

    this.captureId = result.captureId;
    this.analysisId = result.analysisId;

    if (result.status !== 'completed' && result.status !== 'queued') {
      throw new Error(`Unexpected status: ${result.status}`);
    }
  }

  async testGetAnalysis(): Promise<void> {
    if (!this.captureId) {
      throw new Error('No captureId from previous test');
    }

    const response = await axios.get(
      `${API_BASE}/api/captures/${this.captureId}/analysis`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const result = response.data;
    if (!result.analysis) {
      throw new Error('No analysis found for capture');
    }

    const analysis = result.analysis;
    if (!analysis.id || !analysis.capture_id || !analysis.provider) {
      throw new Error('Analysis missing required fields');
    }

    if (analysis.capture_id !== this.captureId) {
      throw new Error('Analysis capture_id mismatch');
    }
  }

  async testAutoTagging(): Promise<void> {
    if (!this.captureId) {
      throw new Error('No captureId from previous test');
    }

    // Get the capture to check if tags were added
    const response = await axios.get(
      `${API_BASE}/api/captures/${this.captureId}`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const capture = response.data;
    
    // Check if AUTO_TAG_FROM_ANALYSIS is enabled
    if (process.env.AUTO_TAG_FROM_ANALYSIS === 'true') {
      if (!Array.isArray(capture.tags) || capture.tags.length === 0) {
        throw new Error('Auto-tagging enabled but no tags found on capture');
      }
      this.log(`Auto-tagging working: ${capture.tags.length} tags added`);
    } else {
      this.log('Auto-tagging disabled, skipping tag verification');
    }
  }

  async testAnalyzeExisting(): Promise<void> {
    if (!this.captureId) {
      throw new Error('No captureId from previous test');
    }

    const response = await axios.post(
      `${API_BASE}/api/captures/${this.captureId}/analyze`,
      { mode: 'sync' },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const result = response.data;
    if (!result.analysisId || !result.status) {
      throw new Error('Missing analysisId or status in response');
    }
  }

  async testJobStatus(): Promise<void> {
    if (!this.analysisId) {
      throw new Error('No analysisId from previous test');
    }

    const response = await axios.get(
      `${API_BASE}/api/analysis/${this.analysisId}`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const result = response.data;
    if (!result.jobId || !result.status) {
      throw new Error('Missing jobId or status in job response');
    }
  }

  async runAllTests(): Promise<void> {
    this.log('🚀 Starting Capture Analysis Integration Smoke Tests');
    this.log(`API Base: ${API_BASE}`);
    this.log(`Auto-tagging: ${process.env.AUTO_TAG_FROM_ANALYSIS || 'false'}`);
    
    await this.runTest('Upload and Analyze', () => this.testUploadAndAnalyze());
    await this.runTest('Get Latest Analysis', () => this.testGetAnalysis());
    await this.runTest('Auto-tagging Check', () => this.testAutoTagging());
    await this.runTest('Analyze Existing Capture', () => this.testAnalyzeExisting());
    await this.runTest('Job Status Check', () => this.testJobStatus());

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);

    this.log('\n📊 SUMMARY:');
    this.log(`✅ Passed: ${passed}/${total}`);
    this.log(`⏱️  Total Time: ${totalTime}ms`);

    if (passed === total) {
      this.log('🎉 ALL TESTS PASSED - Capture Analysis Integration Working!');
      process.exit(0);
    } else {
      this.log('💥 SOME TESTS FAILED:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => this.log(`   ❌ ${r.name}: ${r.error}`));
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  // Check environment
  if (process.env.AUTO_TAG_FROM_ANALYSIS !== 'true') {
    console.log('⚠️  AUTO_TAG_FROM_ANALYSIS not enabled, auto-tagging test will be skipped');
  }

  const runner = new SmokeTestRunner();
  await runner.runAllTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Smoke test runner failed:', error);
    process.exit(1);
  });
}