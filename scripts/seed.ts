// scripts/seed.ts - Strategic Intelligence data seeding for reconciled schema
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { persistSession: false }
  }
)

async function main() {
  console.log('🌱 Seeding strategic intelligence demo data...')

  try {
    // Get any existing user for our demo data
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (!users || users.length === 0) {
      console.log('⚠️  No users found. Please create a user first.')
      return
    }

    const userId = users[0].id
    console.log('✅ Using existing user:', userId)

    // Create strategic intelligence captures
    const strategicCaptures = [
      {
        user_id: userId,
        title: 'TikTok Micro-Treat Trend Analysis',
        content: 'Rising trend of users rewarding themselves with small treats after completing errands. Features POV filming style with on-screen captions showing "one more task → treat" mentality. High engagement with productivity-focused Gen Z audience.',
        platform: 'tiktok',
        url: 'https://tiktok.com/@example/micro-treat-trend',
        tags: ['micro-rewards', 'productivity', 'pov', 'gen-z'],
        viral_score: 78,
        ai_analysis: {
          summary: 'High momentum trend with cross-generational appeal',
          hooks: ['One more task, one more treat', 'POV: You earned this'],
          truth_analysis: {
            fact: 'Users film themselves completing tasks then buying small treats',
            observation: 'Content performs best with authentic, unstaged moments',
            insight: 'Audience craves permission for small indulgences',
            human_truth: 'Everyone needs psychological permission to reward themselves for mundane accomplishments'
          }
        },
        dsd_tags: ['define:motivation-psychology', 'shift:reward-framing', 'deliver:15s-reels'],
        dsd_section: 'define',
        predicted_virality: 0.74,
        actual_virality: 0.82
      },
      {
        user_id: userId,
        title: 'Instagram Budget Energy Discussion',
        content: 'Stories and Reels showing people openly discussing budgeting strategies, featuring phrases like "girl math" and "budget but make it cute". Spans multiple demographics beyond typical finance content.',
        platform: 'instagram',
        url: 'https://instagram.com/p/budget-energy-examples',
        tags: ['budgeting', 'finance', 'girl-math', 'authenticity'],
        viral_score: 65,
        ai_analysis: {
          summary: 'Finance content breakthrough - authenticity over perfection',
          hooks: ['Girl math says this is free', 'Budget but make it cute'],
          truth_analysis: {
            fact: 'Young adults share imperfect budgeting attempts on social media',
            observation: 'Vulnerability about money creates higher engagement than expert advice',
            insight: 'Financial shame is being replaced by financial transparency',
            human_truth: 'Money anxiety decreases when we realize everyone is figuring it out together'
          }
        },
        dsd_tags: ['define:financial-vulnerability', 'shift:money-transparency', 'deliver:authentic-storytelling'],
        dsd_section: 'shift',
        predicted_virality: 0.58,
        actual_virality: 0.71
      }
    ]

    for (const capture of strategicCaptures) {
      const { data: existing } = await supabase
        .from('captures')
        .select('id')
        .eq('title', capture.title)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('captures').insert(capture)
        if (error) console.log(`Warning: ${capture.title} - ${error.message}`)
        else console.log(`✅ Created: ${capture.title}`)
      }
    }

    // Create cultural moments
    const culturalMoments = [
      {
        title: 'Micro-Reward Psychology Shift',
        description: 'Cultural shift toward normalizing small self-rewards as motivation tools for completing mundane tasks. Represents broader acceptance of self-care as productivity strategy.',
        intensity: 7,
        platforms: ['tiktok', 'instagram', 'youtube'],
        demographics: ['gen-z', 'young-millennial', 'urban'],
        duration: 'medium-term-trend'
      },
      {
        title: 'Financial Vulnerability Normalization',
        description: 'Movement away from financial perfectionism toward authentic money conversations. Young adults openly sharing budgeting struggles and imperfect financial decisions.',
        intensity: 6,
        platforms: ['instagram', 'tiktok', 'twitter'],
        demographics: ['gen-z', 'millennial', 'urban', 'suburban'],
        duration: 'long-term-cultural-shift'
      }
    ]

    for (const moment of culturalMoments) {
      const { data: existing } = await supabase
        .from('cultural_moments')
        .select('id')
        .eq('title', moment.title)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('cultural_moments').insert(moment)
        if (error) console.log(`Warning: ${moment.title} - ${error.message}`)
        else console.log(`✅ Created cultural moment: ${moment.title}`)
      }
    }

    // Create DSD brief
    const dsdBrief = {
      user_id: userId,
      title: 'Micro-Treat Launch Strategy Brief',
      status: 'ready-for-review',
      define_section: {
        audience_insights: [
          'Need psychological permission for small indulgences',
          'Struggle with task completion and motivation',
          'Respond to reward-based framing rather than guilt-based messaging'
        ],
        cultural_context: 'Post-pandemic self-care normalization meets productivity anxiety and inflation concerns',
        truth_analysis: 'Everyone needs permission to reward themselves for mundane accomplishments'
      },
      shift_section: {
        strategic_positioning: 'Reframe product as earned mini-reward rather than guilty pleasure or luxury item',
        brand_levers: ['Task completion celebration', 'Self-permission granting', 'Micro-achievement recognition'],
        messaging_shift: 'From "treat yourself" to "you earned this"'
      },
      deliver_section: {
        content_formats: ['POV TikToks showing task completion', 'Before/after completion stories', 'Text overlay trend participation'],
        key_messages: ['You earned this', 'One more task, one more treat', 'Small wins deserve small rewards'],
        creative_guardrails: ['Authentic over polished', 'Relatable tasks only', 'Avoid luxury positioning'],
        success_metrics: ['Engagement authenticity', 'Cross-generational appeal', 'Purchase intent lift']
      }
    }

    const { data: existingBrief } = await supabase
      .from('dsd_briefs')
      .select('id')
      .eq('title', dsdBrief.title)
      .maybeSingle()

    if (!existingBrief) {
      const { error } = await supabase.from('dsd_briefs').insert(dsdBrief)
      if (error) console.log(`Warning: DSD Brief - ${error.message}`)
      else console.log('✅ Created DSD strategic brief')
    }

    console.log('\n🎉 Strategic intelligence seed completed!')
    console.log('📊 Truth Analysis Framework examples ready')
    console.log('🎯 DSD Signal Drop methodology demonstrated')

  } catch (error: any) {
    console.error('❌ Seed failed:', error.message)
  }
}

main()