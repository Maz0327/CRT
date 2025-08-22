// Edge function for DSD Brief Generation
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
    const { briefId, captureIds, clientProfileId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch captures for brief
    const { data: captures, error: capturesError } = await supabaseClient
      .from('captures')
      .select('*')
      .in('id', captureIds);

    if (capturesError) throw capturesError;

    // Fetch client profile if provided
    let clientProfile = null;
    if (clientProfileId) {
      const { data: profile } = await supabaseClient
        .from('client_profiles')
        .select('*')
        .eq('id', clientProfileId)
        .single();
      clientProfile = profile;
    }

    // Generate DSD Brief with AI
    const briefGeneration = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are creating a strategic DSD Brief using the Define→Shift→Deliver methodology.
            
            DEFINE: Establish the strategic foundation
            - Current reality and challenges
            - Target audience insights
            - Market context
            
            SHIFT: Strategic transformation approach
            - Key behavioral changes needed
            - Cultural moments to leverage
            - Strategic positioning
            
            DELIVER: Tactical execution plan
            - Content strategy
            - Channel approach
            - Success metrics
            
            Generate a comprehensive brief based on the captured content.
            ${clientProfile ? `Align with client profile: ${JSON.stringify(clientProfile)}` : ''}
            Respond in JSON format with all three sections.`,
          },
          {
            role: 'user',
            content: `Generate DSD Brief from these captures:\n\n${JSON.stringify(captures)}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const result = await briefGeneration.json();
    const brief = JSON.parse(result.choices[0].message.content);

    // Update brief in database
    if (briefId) {
      const { error: updateError } = await supabaseClient
        .from('dsd_briefs')
        .update({
          define_section: brief.define,
          shift_section: brief.shift,
          deliver_section: brief.deliver,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', briefId);

      if (updateError) {
        console.error('Error updating brief:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        brief: brief,
        methodology: 'DSD Signal Drop v2.0',
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