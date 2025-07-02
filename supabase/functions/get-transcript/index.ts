
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching transcript for video: ${videoId}`);

    // Try to fetch transcript from YouTube's timedtext API
    const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
    
    try {
      const response = await fetch(transcriptUrl);
      
      if (!response.ok) {
        throw new Error('Transcript not available');
      }

      const xmlText = await response.text();
      
      // Parse the XML transcript
      const transcript = parseTranscriptXML(xmlText);
      
      if (transcript.length === 0) {
        throw new Error('No transcript content found');
      }

      return new Response(
        JSON.stringify({ 
          transcript,
          available: true 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (transcriptError) {
      console.log(`Transcript fetch failed: ${transcriptError.message}`);
      
      return new Response(
        JSON.stringify({ 
          transcript: [],
          available: false,
          error: 'Transcript not available'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in get-transcript function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function parseTranscriptXML(xmlText: string): TranscriptItem[] {
  const transcript: TranscriptItem[] = [];
  
  // Simple regex-based XML parsing for transcript entries
  const textRegex = /<text start="([^"]*)"[^>]*dur="([^"]*)"[^>]*>([^<]*)<\/text>/g;
  let match;
  
  while ((match = textRegex.exec(xmlText)) !== null) {
    const start = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const text = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    if (text) {
      transcript.push({
        text,
        start,
        duration
      });
    }
  }
  
  return transcript;
}

serve(handler);
