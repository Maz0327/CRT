#!/usr/bin/env tsx
// Smoke Test: Brief Canvas Backend (Task Block #7)
// Tests the Brief Canvas domain model with pages, blocks, snapshots, locks, and publishing

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

class BriefCanvasSmokeTest {
  private results: TestResult[] = [];
  private testBriefId?: string;
  private lockToken?: string;
  private snapshotId?: string;

  private log(message: string) {
    console.log(`[BRIEF CANVAS SMOKE] ${message}`);
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

  async createTestBrief(): Promise<void> {
    // Create a brief using existing endpoint
    const response = await axios.post(
      `${API_BASE}/api/briefs`,
      {
        title: 'Canvas Smoke Test Brief',
        description: 'Test brief for canvas functionality'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 201) {
      throw new Error(`Failed to create test brief: ${response.status}`);
    }

    this.testBriefId = response.data.id;
    this.log(`Created test brief: ${this.testBriefId}`);
  }

  async testAcquireLock(): Promise<void> {
    if (!this.testBriefId) {
      throw new Error('No test brief ID available');
    }

    const response = await axios.post(
      `${API_BASE}/api/briefs/${this.testBriefId}/lock`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to acquire lock: ${response.status}`);
    }

    const { lockToken, expires_at } = response.data;
    if (!lockToken || !expires_at) {
      throw new Error('Lock response missing token or expiry');
    }

    this.lockToken = lockToken;
    this.log(`Acquired lock token: ${lockToken.substring(0, 8)}...`);
  }

  async testCanvasOperations(): Promise<void> {
    if (!this.testBriefId || !this.lockToken) {
      throw new Error('Missing brief ID or lock token');
    }

    // Test canvas patch with operations
    const response = await axios.patch(
      `${API_BASE}/api/briefs/${this.testBriefId}/canvas`,
      {
        lockToken: this.lockToken,
        ops: [
          {
            type: 'upsert_page',
            payload: {
              title: 'Test Page 1',
              index_no: 0
            }
          },
          {
            type: 'upsert_block',
            payload: {
              type: 'text',
              x: 0,
              y: 0,
              w: 6,
              h: 4,
              z: 1,
              content: {
                html: '<p>Test text block</p>',
                plain: 'Test text block'
              }
            }
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Canvas operations failed: ${response.status}`);
    }

    const { success, results } = response.data;
    if (!success || !results || results.length === 0) {
      throw new Error('Canvas operations returned no results');
    }

    this.log(`Canvas operations completed: ${results.length} changes`);
  }

  async testGetCanvasState(): Promise<void> {
    if (!this.testBriefId) {
      throw new Error('No test brief ID available');
    }

    const response = await axios.get(
      `${API_BASE}/api/briefs/${this.testBriefId}/canvas`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get canvas state: ${response.status}`);
    }

    const { brief, pages, blocks, lock, autosave } = response.data;

    if (!brief || !brief.id) {
      throw new Error('Canvas state missing brief data');
    }

    if (!Array.isArray(pages) || !Array.isArray(blocks)) {
      throw new Error('Canvas state missing pages or blocks arrays');
    }

    if (!autosave || !autosave.intervalMs) {
      throw new Error('Canvas state missing autosave config');
    }

    this.log(`Canvas state: ${pages.length} pages, ${blocks.length} blocks`);
  }

  async testCreateSnapshot(): Promise<void> {
    if (!this.testBriefId) {
      throw new Error('No test brief ID available');
    }

    const response = await axios.post(
      `${API_BASE}/api/briefs/${this.testBriefId}/snapshots`,
      {
        reason: 'smoke_test_snapshot'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to create snapshot: ${response.status}`);
    }

    const { success, snapshot } = response.data;
    if (!success || !snapshot || !snapshot.id) {
      throw new Error('Snapshot creation returned invalid data');
    }

    this.snapshotId = snapshot.id;
    this.log(`Created snapshot: ${this.snapshotId}`);
  }

  async testListSnapshots(): Promise<void> {
    if (!this.testBriefId) {
      throw new Error('No test brief ID available');
    }

    const response = await axios.get(
      `${API_BASE}/api/briefs/${this.testBriefId}/snapshots?page=1&pageSize=10`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to list snapshots: ${response.status}`);
    }

    const { snapshots, total } = response.data;
    if (!Array.isArray(snapshots)) {
      throw new Error('Snapshots list is not an array');
    }

    if (total < 1) {
      throw new Error('Expected at least 1 snapshot');
    }

    this.log(`Found ${total} snapshots`);
  }

  async testPublishBrief(): Promise<void> {
    if (!this.testBriefId) {
      throw new Error('No test brief ID available');
    }

    const response = await axios.post(
      `${API_BASE}/api/briefs/${this.testBriefId}/publish`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to publish brief: ${response.status}`);
    }

    const { success, status } = response.data;
    if (!success || status !== 'ready') {
      throw new Error(`Publish failed or wrong status: ${status}`);
    }

    this.log(`Brief published successfully with status: ${status}`);
  }

  async testLockHeartbeat(): Promise<void> {
    if (!this.testBriefId || !this.lockToken) {
      throw new Error('Missing brief ID or lock token');
    }

    const response = await axios.post(
      `${API_BASE}/api/briefs/${this.testBriefId}/lock/heartbeat`,
      {
        lockToken: this.lockToken
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Lock heartbeat failed: ${response.status}`);
    }

    const { expires_at } = response.data;
    if (!expires_at) {
      throw new Error('Heartbeat response missing expires_at');
    }

    this.log(`Lock heartbeat successful, expires: ${expires_at}`);
  }

  async runAllTests(): Promise<void> {
    this.log('🚀 Starting Brief Canvas Backend Smoke Tests');
    this.log(`API Base: ${API_BASE}`);
    
    await this.runTest('Create Test Brief', () => this.createTestBrief());
    await this.runTest('Acquire Lock', () => this.testAcquireLock());
    await this.runTest('Canvas Operations (Pages/Blocks)', () => this.testCanvasOperations());
    await this.runTest('Get Canvas State', () => this.testGetCanvasState());
    await this.runTest('Create Snapshot', () => this.testCreateSnapshot());
    await this.runTest('List Snapshots', () => this.testListSnapshots());
    await this.runTest('Lock Heartbeat', () => this.testLockHeartbeat());
    await this.runTest('Publish Brief', () => this.testPublishBrief());

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
      this.log('🎉 ALL TESTS PASSED - Brief Canvas Backend Working!');
      if (this.testBriefId) {
        this.log(`🧪 Test Brief ID: ${this.testBriefId} (can be used for manual testing)`);
      }
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
  const tester = new BriefCanvasSmokeTest();
  await tester.runAllTests();
}

// Run main function directly in ES module
main().catch(error => {
  console.error('💥 Brief Canvas smoke test runner failed:', error);
  process.exit(1);
});