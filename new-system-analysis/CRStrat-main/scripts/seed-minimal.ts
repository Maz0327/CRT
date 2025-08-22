import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedMinimal() {
  try {
    // Check if data already exists
    const { data: existingCaptures } = await supabase.from('captures').select('id').limit(1);
    const { data: existingMoments } = await supabase.from('cultural_moments').select('id').limit(1);
    const { data: existingBriefs } = await supabase.from('dsd_briefs').select('id').limit(1);

    if (existingCaptures?.length && existingMoments?.length && existingBriefs?.length) {
      console.log('Data already exists, skipping seed');
      return;
    }

    // Use existing user ID
    const userId = '1a731808-5e88-4b03-bdf5-a5f56303c373';

    // Seed captures if empty
    if (!existingCaptures?.length) {
      const { error: captureError } = await supabase.from('captures').insert({
        title: 'Micro-Treat Viral Post',
        content: 'Sample viral content about micro-treats gaining popularity',
        platform: 'twitter',
        url: 'https://example.com/trending-post',
        tags: ['micro-treats', 'viral', 'food-trends'],
        user_id: userId
      });
      
      if (captureError) throw captureError;
      console.log('Seeded captures');
    }

    // Seed cultural_moments if empty
    if (!existingMoments?.length) {
      const { error: momentError } = await supabase.from('cultural_moments').insert({
        title: 'Micro-Treat Trend Emergence',
        description: 'Small, affordable luxury experiences gaining traction across demographics',
        intensity: 7.5,
        cross_generational_appeal: 8.2,
        virality_factors: ['affordability', 'instagram-worthy', 'self-care'],
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (momentError) throw momentError;
      console.log('Seeded cultural_moments');
    }

    // Seed dsd_briefs if empty
    if (!existingBriefs?.length) {
      const { error: briefError } = await supabase.from('dsd_briefs').insert({
        title: 'Micro-Treat Strategy Brief',
        status: 'draft',
        define_section: 'Target emerging micro-treat trend for budget-conscious consumers',
        shift_section: 'Position brand as accessible luxury enabler',
        deliver_section: 'Launch curated micro-experience collection',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (briefError) throw briefError;
      console.log('Seeded dsd_briefs');
    }

    console.log('Minimal seed completed');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedMinimal();