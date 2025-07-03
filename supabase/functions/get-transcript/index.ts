import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// 🔑 import the right thing:
import { YoutubeTranscript } from "npm:youtube-transcript";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const bodyText = await req.text();
  console.log("➡️ Raw Body:", JSON.stringify(bodyText)); // now this will be your JSON string
  let videoId;
  try {
    const parsed = JSON.parse(bodyText);
    videoId = parsed.videoId;
  } catch  {
    console.error("❌ Failed to parse JSON body");
  }
  if (!videoId) {
    return new Response(JSON.stringify({
      error: "Video ID is required"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    // ▶️ call the library correctly:
    const transcript = await YoutubeTranscript.fetchTranscript(videoId /*, optional config */ );
    return new Response(JSON.stringify({
      transcript,
      available: transcript.length > 0
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Transcript fetch failed:", err);
    return new Response(JSON.stringify({
      transcript: [],
      available: false,
      error: err.message
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
