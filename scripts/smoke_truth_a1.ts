import fetch from 'node-fetch';
const BASE = process.env.BASE_URL || 'http://localhost:5000';

async function smokeTruthA1() {
  try {
    console.log('🧪 Starting Truth Lab A1 smoke tests...');
    
    // 1) extract
    const url = 'https://example.com'; // Simple, reliable test page
    console.log(`📡 Testing extract from: ${url}`);
    
    let r = await fetch(`${BASE}/api/truth/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!r.ok) {
      const error = await r.text();
      throw new Error(`extract failed ${r.status}: ${error}`);
    }
    
    const ex = await r.json() as any;
    console.log('✅ Extract ok:', ex.id, `Text length: ${(ex.extracted_text || '').length}`);
    console.log('📸 Images found:', ex.extracted_images?.length || 0);

    // 2) analyze-text quick
    console.log(`🔍 Testing text analysis for ID: ${ex.id}`);
    
    r = await fetch(`${BASE}/api/truth/analyze-text/${ex.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (!r.ok) {
      const error = await r.text();
      throw new Error(`analyze-text failed ${r.status}: ${error}`);
    }
    
    const an = await r.json() as any;
    console.log('✅ Analyze-text ok');
    console.log('📊 Truth layers:', Object.keys(an.result_truth || {}));
    console.log('🎯 Strategic fields:', Object.keys(an.result_strategic || {}));
    console.log('👥 Cohorts found:', an.result_cohorts?.length || 0);

    // 3) fetch the result
    console.log(`📋 Testing get truth check for ID: ${ex.id}`);
    
    r = await fetch(`${BASE}/api/truth/${ex.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!r.ok) {
      const error = await r.text();
      throw new Error(`get truth check failed ${r.status}: ${error}`);
    }
    
    const final = await r.json() as any;
    console.log('✅ Get truth check ok');
    console.log('📈 Final status:', final.status);
    console.log('⏰ Created:', new Date(final.created_at).toISOString());
    
    console.log('\n🎉 All Truth Lab A1 smoke tests passed!');
    
  } catch (error) {
    console.error('❌ Smoke test failed:', error);
    process.exit(1);
  }
}

// Run the smoke test
smokeTruthA1();