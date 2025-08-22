// Edge function for Truth Analysis Framework
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { captureId, content } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Truth Analysis with GPT-5 selective reasoning
    const truthAnalysis = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are implementing the Truth Analysis Framework with 4 philosophical layers:
            
            1. FACT LAYER: Observable, measurable reality
            2. OBSERVATION LAYER: Patterns and behaviors noticed
            3. INSIGHT LAYER: Deep understanding and connections
            4. HUMAN TRUTH LAYER: Universal emotional/psychological reality
            
            Analyze the content through each layer and provide strategic insights.
            Use selective reasoning to identify the most profound truths.
            Respond in JSON format with all 4 layers.`,
          },
          {
            role: 'user',
            content: `Analyze this content through the Truth Analysis Framework:\n\n${content}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const result = await truthAnalysis.json();
    const analysis = JSON.parse(result.choices[0].message.content);

    // Store truth analysis
    if (captureId) {
      const { error } = await supabaseClient
        .from('captures')
        .update({
          ai_analysis: {
            ...analysis,
            truth_framework: {
              fact_layer: analysis.fact_layer,
              observation_layer: analysis.observation_layer,
              insight_layer: analysis.insight_layer,
              human_truth_layer: analysis.human_truth_layer,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', captureId);

      if (error) {
        console.error('Error updating capture with truth analysis:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysis,
        framework: 'Truth Analysis Framework v2.0',
      }),
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