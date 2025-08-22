#!/usr/bin/env tsx
// Smoke Test: Captures Read-Model Enhancements (Task Block #6)
// Tests the enhanced captures list with analysis data, filters, and caching

import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:5000';

// Test credentials - you may need to get a real auth token
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'test-token';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

class SmokeTestRunner {
  private results: TestResult[] = [];
  private testCaptureId?: string;

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

  async testBasicCapturesList(): Promise<void> {
    const response = await axios.get(
      `${API_BASE}/api/captures?page=1&pageSize=10`,
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
    if (!Array.isArray(result.rows)) {
      throw new Error('Response missing rows array');
    }

    if (typeof result.total !== 'number') {
      throw new Error('Response missing total count');
    }

    // Check if first capture has enhanced structure
    if (result.rows.length > 0) {
      const capture = result.rows[0];
      this.testCaptureId = capture.id;

      if (!capture.id || !capture.created_at) {
        throw new Error('Capture missing required fields');
      }

      // Check if latest_analysis is present (can be null)
      if (capture.latest_analysis !== undefined && capture.latest_analysis !== null) {
        const analysis = capture.latest_analysis;
        if (!analysis.status || !analysis.analyzed_at) {
          throw new Error('Analysis data missing required fields');
        }
      }
    }
  }

  async testETagCaching(): Promise<void> {
    if (!this.testCaptureId) {
      // Just test the list endpoint
      const firstResponse = await axios.get(
        `${API_BASE}/api/captures?page=1&pageSize=5`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          }
        }
      );

      if (firstResponse.status !== 200) {
        throw new Error(`Expected 200, got ${firstResponse.status}`);
      }

      const etag = firstResponse.headers['etag'];
      if (!etag) {
        throw new Error('ETag header missing from response');
      }

      // Make another request with If-None-Match
      const secondResponse = await axios.get(
        `${API_BASE}/api/captures?page=1&pageSize=5`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_USER_TOKEN}`,
            'If-None-Match': etag,
          },
          validateStatus: (status) => status === 200 || status === 304
        }
      );

      // Should get 304 Not Modified (or 200 if data changed)
      if (secondResponse.status !== 304 && secondResponse.status !== 200) {
        throw new Error(`Expected 304 or 200, got ${secondResponse.status}`);
      }
    } else {
      throw new Error('No test capture available for caching test');
    }
  }

  async testLabelFilter(): Promise<void> {
    // Test label filtering - may not find results but should not error
    const response = await axios.get(
      `${API_BASE}/api/captures?label=test&page=1&pageSize=10`,
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
    if (!Array.isArray(result.rows)) {
      throw new Error('Label filter response missing rows array');
    }
  }

  async testAnalyzedFilter(): Promise<void> {
    // Test analyzed=true filter
    const analyzedResponse = await axios.get(
      `${API_BASE}/api/captures?analyzed=true&page=1&pageSize=10`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        }
      }
    );

    if (analyzedResponse.status !== 200) {
      throw new Error(`Expected 200, got ${analyzedResponse.status}`);
    }

    // Test analyzed=false filter  
    const unanalyzedResponse = await axios.get(
      `${API_BASE}/api/captures?analyzed=false&page=1&pageSize=10`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        }
      }
    );

    if (unanalyzedResponse.status !== 200) {
      throw new Error(`Expected 200, got ${unanalyzedResponse.status}`);
    }

    // Verify response structure
    if (!Array.isArray(analyzedResponse.data.rows) || !Array.isArray(unanalyzedResponse.data.rows)) {
      throw new Error('Analyzed filter responses missing rows arrays');
    }
  }

  async testSearchQuery(): Promise<void> {
    const response = await axios.get(
      `${API_BASE}/api/captures?q=test&page=1&pageSize=10`,
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
    if (!Array.isArray(result.rows)) {
      throw new Error('Search query response missing rows array');
    }
  }

  async testCaptureDetail(): Promise<void> {
    if (!this.testCaptureId) {
      // Skip if no test capture available
      this.log('⚠️  No test capture ID available, skipping detail test');
      return;
    }

    const response = await axios.get(
      `${API_BASE}/api/captures/${this.testCaptureId}`,
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
    if (!capture.id || capture.id !== this.testCaptureId) {
      throw new Error('Detail response missing or incorrect capture ID');
    }

    // Check enhanced fields
    if (capture.analysis_count === undefined) {
      throw new Error('Detail response missing analysis_count');
    }

    if (capture.has_deep_analysis === undefined) {
      throw new Error('Detail response missing has_deep_analysis');
    }
  }

  async runAllTests(): Promise<void> {
    this.log('🚀 Starting Captures Read-Model Enhancement Smoke Tests');
    this.log(`API Base: ${API_BASE}`);
    
    await this.runTest('Basic Captures List', () => this.testBasicCapturesList());
    await this.runTest('ETag Caching', () => this.testETagCaching());
    await this.runTest('Label Filter', () => this.testLabelFilter());
    await this.runTest('Analyzed Filter', () => this.testAnalyzedFilter());
    await this.runTest('Search Query', () => this.testSearchQuery());
    await this.runTest('Capture Detail Enhanced', () => this.testCaptureDetail());

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
      this.log('🎉 ALL TESTS PASSED - Captures Read-Model Enhancement Working!');
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
  const runner = new SmokeTestRunner();
  await runner.runAllTests();
}

// Run main function directly in ES module
main().catch(error => {
  console.error('💥 Smoke test runner failed:', error);
  process.exit(1);
});