// Edge function for AI content analysis
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, platform, captureId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Call OpenAI API for analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert content analyst for the Strategic Intelligence platform. 
            Analyze the following content and provide:
            1. Viral potential score (0-100)
            2. Key themes and patterns
            3. Recommended DSD tags
            4. Cultural moment indicators
            5. Strategic insights
            Respond in JSON format.`,
          },
          {
            role: 'user',
            content: `Platform: ${platform}\nContent: ${content}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const analysis = await openAIResponse.json();
    const result = JSON.parse(analysis.choices[0].message.content);

    // Update capture with analysis
    if (captureId) {
      const { error: updateError } = await supabaseClient
        .from('captures')
        .update({
          ai_analysis: result,
          viral_score: result.viral_potential_score,
          dsd_tags: result.recommended_dsd_tags,
          predicted_virality: result.viral_potential_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', captureId);

      if (updateError) {
        console.error('Error updating capture:', updateError);
      }

      // Check for cultural moment detection
      if (result.viral_potential_score >= 85) {
        const { error: momentError } = await supabaseClient
          .from('cultural_moments')
          .insert({
            title: result.cultural_moment_title || 'Emerging Trend',
            description: result.cultural_moment_description || 'High viral potential detected',
            intensity: result.viral_potential_score / 10,
            platforms: [platform],
            demographics: result.demographics || [],
            duration: '24-48 hours',
          });

        if (momentError) {
          console.error('Error creating cultural moment:', momentError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});