/**
 * Smoke test for signals API endpoints
 * Usage: tsx scripts/smoke-signals.ts
 */

import { createSignal, confirmSignal, needsEditSignal, listSignals } from "../server/services/signals";

async function smokeTest() {
  try {
    console.log('🧪 Starting signals smoke test...');
    
    // Test data
    const userId = "test-user-id";
    const projectId = "test-project-id";
    
    // 1. Create a dummy signal
    console.log('📝 Creating signal...');
    const signal = await createSignal({
      projectId,
      created_by: userId,
      title: "Test Signal: AI fatigue accelerates authentic content",
      summary: "Users report AI content burnout; authentic human stories see higher engagement.",
      truth_chain: {
        fact: "AI detection tools flagging 40% of content as machine-generated.",
        observation: "Human-authored posts with personal stories outperform AI content.",
        insight: "Authenticity becomes premium in saturated AI content space.",
        human_truth: "People crave genuine human connection, not polished perfection.",
        cultural_moment: "Return to raw, unfiltered human storytelling."
      },
      strategic_moves: ["Lean into imperfection", "Share behind-the-scenes", "Highlight human authors"],
      cohorts: ["Content creators", "Brand managers"],
      receipts: [
        {
          quote: "This feels real, finally!",
          url: "https://example.com/authentic-post",
          timestamp: new Date().toISOString(),
          source: "Twitter"
        }
      ],
      confidence: 0.85,
      why_surfaced: "Trending in 3 similar projects",
      origin: "analysis",
      source_tag: "Test"
    });
    
    console.log('✅ Signal created:', { id: signal.id, status: signal.status });
    
    // 2. List signals (should show 1 unreviewed)
    console.log('📋 Listing signals...');
    const signals = await listSignals({ userId, projectId, status: 'unreviewed' });
    console.log('✅ Found signals:', signals.length);
    
    // 3. Confirm signal
    console.log('✔️ Confirming signal...');
    const confirmed = await confirmSignal(signal.id, userId);
    console.log('✅ Signal confirmed:', { status: confirmed?.status });
    
    // 4. Create another signal and mark needs edit
    console.log('📝 Creating second signal...');
    const signal2 = await createSignal({
      projectId,
      created_by: userId,
      title: "Short Signal: Video length preferences shift",
      summary: "Users prefer 30-second clips over 10-minute content.",
      confidence: 0.45,
      origin: "analysis"
    });
    
    console.log('⚠️ Marking signal as needs edit...');
    const needsEdit = await needsEditSignal(signal2.id, userId, "Title too short, add more context");
    console.log('✅ Signal marked needs edit:', { status: needsEdit?.status });
    
    // 5. Final list check
    console.log('📊 Final status check...');
    const confirmed_list = await listSignals({ userId, projectId, status: 'confirmed' });
    const needs_edit_list = await listSignals({ userId, projectId, status: 'needs_edit' });
    
    console.log('✅ SMOKE TEST PASSED!');
    console.log(`   Confirmed: ${confirmed_list.length}`);
    console.log(`   Needs Edit: ${needs_edit_list.length}`);
    
  } catch (error) {
    console.error('❌ SMOKE TEST FAILED:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  smokeTest().catch(console.error);
}